// Medical Chatbot Chat Service
// Handles message persistence, real-time subscriptions, and conversation management

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { ChatMessage, IChatService } from '../types/chatbot.types';
import { environmentConfig } from '../config/environment';

export class ChatService implements IChatService {
  private messagesCollection = firestore().collection('chatMessages');
  private conversationsCollection = firestore().collection('conversations');

  // Kimlik doğrulama kontrolü
  private verifyAuth(userId: string): void {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated. Please sign in.');
    }
    if (currentUser.uid !== userId) {
      throw new Error('User ID mismatch. Operation not allowed.');
    }
  }

  // Firestore hata yönetimi
  private handleFirestoreError(error: any, operation: string): Error {
    if (error.code === 'permission-denied' || error.code === 'firestore/permission-denied') {
      return new Error(`Permission denied: You don't have permission to ${operation}. Please ensure you're signed in.`);
    }
    if (error.code === 'unauthenticated' || error.code === 'firestore/unauthenticated') {
      return new Error(`Authentication required: Please sign in to ${operation}.`);
    }
    if (error.message) {
      return new Error(`Failed to ${operation}: ${error.message}`);
    }
    return new Error(`Failed to ${operation}: ${error.code || 'Unknown error'}`);
  }

  // Get user-specific messages collection
  private getUserMessagesCollection(userId: string) {
    return firestore()
      .collection('users')
      .doc(userId)
      .collection('chatMessages');
  }

  // Get user-specific conversations collection
  private getUserConversationsCollection(userId: string) {
    return firestore()
      .collection('users')
      .doc(userId)
      .collection('conversations');
  }

  /**
   * Send a message and persist it to Firestore
   */
  async sendMessage(message: string, userId: string): Promise<ChatMessage> {
    try {
      // Validate input
      if (!message.trim()) {
        throw new Error('Message content cannot be empty');
      }

      if (!userId) {
        throw new Error('User ID is required');
      }

      // Verify authentication
      this.verifyAuth(userId);

      // Create message object
      const chatMessage: ChatMessage = {
        id: '', // Will be set by Firestore
        userId,
        content: message.trim(),
        sender: 'user',
        timestamp: new Date(),
        status: 'sending',
        messageType: 'text',
      };

      // Prepare Firestore data - remove undefined values and empty id
      const firestoreData: any = {};
      
      // Only add defined values
      if (chatMessage.userId) firestoreData.userId = chatMessage.userId;
      if (chatMessage.content) firestoreData.content = chatMessage.content;
      if (chatMessage.sender) firestoreData.sender = chatMessage.sender;
      firestoreData.timestamp = firestore.FieldValue.serverTimestamp();
      if (chatMessage.status) firestoreData.status = chatMessage.status;
      if (chatMessage.messageType) firestoreData.messageType = chatMessage.messageType;

      // Only include metadata if it exists and is not empty
      // Remove undefined values from metadata
      if (chatMessage.metadata && typeof chatMessage.metadata === 'object' && Object.keys(chatMessage.metadata).length > 0) {
        const cleanMetadata: any = {};
        Object.keys(chatMessage.metadata).forEach(key => {
          const value = (chatMessage.metadata as any)[key];
          if (value !== undefined && value !== null) {
            cleanMetadata[key] = value;
          }
        });
        if (Object.keys(cleanMetadata).length > 0) {
          firestoreData.metadata = cleanMetadata;
        }
      }

      // Final cleanup - remove any remaining undefined values
      const finalData: any = {};
      Object.keys(firestoreData).forEach(key => {
        if (firestoreData[key] !== undefined) {
          finalData[key] = firestoreData[key];
        }
      });

      // Save to Firestore
      const messagesCollection = this.getUserMessagesCollection(userId);
      console.log('💾 ChatService: Saving user message to Firestore:', {
        content: finalData.content,
        contentLength: finalData.content?.length || 0,
        sender: finalData.sender,
        userId: finalData.userId
      });
      const docRef = await messagesCollection.add(finalData);
      console.log('💾 ChatService: User message saved with ID:', docRef.id);

      // Update message with generated ID
      const savedMessage: ChatMessage = {
        ...chatMessage,
        id: docRef.id,
        status: 'sent',
      };

      // Update conversation thread
      await this.updateConversationThread(userId, savedMessage);

      return savedMessage;
    } catch (error: any) {
      console.error('ChatService sendMessage error:', error);
      throw this.handleFirestoreError(error, 'send message');
    }
  }

  /**
   * Get conversation history for a user
   */
  async getConversationHistory(userId: string, limit: number = 50): Promise<ChatMessage[]> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      // Verify authentication
      this.verifyAuth(userId);

      const messagesCollection = this.getUserMessagesCollection(userId);
      const snapshot = await messagesCollection
        .orderBy('timestamp', 'asc')
        .limit(limit)
        .get();

      const messages: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          userId: data.userId,
          content: data.content,
          sender: data.sender,
          timestamp: data.timestamp?.toDate() || new Date(),
          status: data.status || 'delivered',
          messageType: data.messageType || 'text',
          metadata: data.metadata,
        });
      });

      // Messages are already in ascending order (oldest first) from orderBy('timestamp', 'asc')
      // Return as is - oldest messages first, newest messages last
      return messages;
    } catch (error: any) {
      console.error('ChatService getConversationHistory error:', error);
      throw this.handleFirestoreError(error, 'get conversation history');
    }
  }

  /**
   * Subscribe to real-time message updates
   */
  subscribeToMessages(
    userId: string,
    callback: (messages: ChatMessage[]) => void
  ): () => void {
    if (!userId) {
      console.error('User ID is required for message subscription');
      return () => {};
    }

    // Verify authentication
    try {
      this.verifyAuth(userId);
    } catch (error) {
      console.error('Authentication failed for message subscription:', error);
      return () => {};
    }

    const messagesCollection = this.getUserMessagesCollection(userId);
    
    return messagesCollection
      .orderBy('timestamp', 'asc')
      .onSnapshot(
        (snapshot) => {
          const messages: ChatMessage[] = [];
          
          console.log('🔥 ChatService: Firestore snapshot received, docs count:', snapshot.docs.length);
          
          snapshot.forEach((doc) => {
            const data = doc.data();
            const message = {
              id: doc.id,
              userId: data.userId,
              content: data.content,
              sender: data.sender,
              timestamp: data.timestamp?.toDate() || new Date(),
              status: data.status || 'delivered',
              messageType: data.messageType || 'text',
              metadata: data.metadata,
            };
            
            console.log('🔥 ChatService: Parsed message from Firestore:', {
              id: message.id,
              sender: message.sender,
              hasContent: !!message.content,
              contentLength: message.content?.length || 0,
              contentPreview: message.content?.substring(0, 50) || 'NO CONTENT',
              rawData: {
                hasContent: !!data.content,
                contentType: typeof data.content,
                contentValue: data.content
              }
            });
            
            messages.push(message);
          });

          console.log('🔥 ChatService: Calling callback with', messages.length, 'messages');
          callback(messages);
        },
        (error) => {
          console.error('Error in message subscription:', error);
          // Call callback with empty array on error
          callback([]);
        }
      );
  }

  /**
   * Mark a message as read
   */
  async markMessageAsRead(messageId: string, userId?: string): Promise<void> {
    try {
      if (!messageId) {
        throw new Error('Message ID is required');
      }

      // If userId is provided, use user-specific collection
      if (userId) {
        this.verifyAuth(userId);
        const messageRef = this.getUserMessagesCollection(userId).doc(messageId);
        await messageRef.update({
          status: 'read',
          readAt: firestore.FieldValue.serverTimestamp(),
        });
      } else {
        // Fallback to global collection (for backward compatibility)
        const messageRef = this.messagesCollection.doc(messageId);
        await messageRef.update({
          status: 'read',
          readAt: firestore.FieldValue.serverTimestamp(),
        });
      }
    } catch (error: any) {
      console.error('ChatService markMessageAsRead error:', error);
      throw this.handleFirestoreError(error, 'mark message as read');
    }
  }

  /**
   * Add a bot response message
   */
  async addBotMessage(
    content: string,
    userId: string,
    messageType: ChatMessage['messageType'] = 'text',
    metadata?: ChatMessage['metadata']
  ): Promise<ChatMessage> {
    try {
      if (!content.trim()) {
        throw new Error('Bot message content cannot be empty');
      }

      if (!userId) {
        throw new Error('User ID is required');
      }

      // Verify authentication
      this.verifyAuth(userId);

      // Clean content: remove Turkish disclaimers and replace with English if needed
      let cleanedContent = content.trim();
      
      // Remove Turkish disclaimer patterns
      const turkishDisclaimerPatterns = [
        /⚠️\s*Bu bilgiler sadece genel[\s\S]*?sağlık profesyoneli[\s\S]*?görüşün\.?/gi,
        /⚠️\s*Bu bilgiler sadece genel[\s\S]*?tedavi için[\s\S]*?görüşün\.?/gi,
        /Bu bilgiler sadece genel bilgilendirme amaçlıdır[\s\S]*?sağlık profesyoneli[\s\S]*?görüşün\.?/gi,
        /💊\s*İlaç bilgileri sadece bilgilendirme amaçlıdır[\s\S]*?doktorunuza danışın\.?/gi,
        /İlaç bilgileri sadece bilgilendirme amaçlıdır[\s\S]*?İlaç kullanımı konusunda[\s\S]*?doktorunuza danışın\.?/gi,
        /İlaç kullanımı konusunda mutlaka doktorunuza danışın\.?/gi,
        /kullanımı konusunda mutlaka[\s\S]*?doktorunuza danışın\.?/gi,
        /ACİL DURUM TESPİT EDİLDİ[!]?[\s\S]*?/gi,
        /Derhal\s*112['yi\s]*arayın[\s\S]*?/gi,
        /Derhal\s*112[\s\S]*?/gi,
      ];
      
      turkishDisclaimerPatterns.forEach(pattern => {
        cleanedContent = cleanedContent.replace(pattern, '');
      });
      
      // Clean up extra newlines
      cleanedContent = cleanedContent.replace(/\n{3,}/g, '\n\n').trim();

      // Check if content already has a disclaimer (English or Turkish)
      const hasDisclaimerInContent = 
        cleanedContent.includes('⚠️') || 
        cleanedContent.includes('This information is for general') ||
        cleanedContent.includes('healthcare professional') ||
        cleanedContent.includes('Bu bilgiler sadece genel') ||
        cleanedContent.includes('sağlık profesyoneli') ||
        cleanedContent.includes('İlaç bilgileri sadece') ||
        cleanedContent.includes('İlaç kullanımı konusunda') ||
        cleanedContent.includes('kullanımı konusunda mutlaka') ||
        cleanedContent.includes('ACİL DURUM TESPİT') ||
        cleanedContent.includes('Derhal 112');

      // Adjust metadata: if disclaimer is already in content, don't show separate disclaimer
      const adjustedMetadata = { ...metadata };
      if (hasDisclaimerInContent && adjustedMetadata.disclaimerShown) {
        adjustedMetadata.disclaimerShown = false;
      }

      const botMessage: ChatMessage = {
        id: '',
        userId,
        content: cleanedContent,
        sender: 'bot',
        timestamp: new Date(),
        status: 'delivered',
        messageType,
        metadata: adjustedMetadata,
      };

      // Prepare Firestore data - remove undefined values and empty id
      const firestoreData: any = {};
      
      // Only add defined values
      if (botMessage.userId) firestoreData.userId = botMessage.userId;
      if (botMessage.content) firestoreData.content = botMessage.content;
      if (botMessage.sender) firestoreData.sender = botMessage.sender;
      firestoreData.timestamp = firestore.FieldValue.serverTimestamp();
      if (botMessage.status) firestoreData.status = botMessage.status;
      if (botMessage.messageType) firestoreData.messageType = botMessage.messageType;

      // Only include metadata if it exists and is not empty
      // Remove undefined values from metadata
      if (metadata && typeof metadata === 'object' && Object.keys(metadata).length > 0) {
        const cleanMetadata: any = {};
        Object.keys(metadata).forEach(key => {
          const value = (metadata as any)[key];
          if (value !== undefined && value !== null) {
            cleanMetadata[key] = value;
          }
        });
        if (Object.keys(cleanMetadata).length > 0) {
          firestoreData.metadata = cleanMetadata;
        }
      }

      // Final cleanup - remove any remaining undefined values
      const finalData: any = {};
      Object.keys(firestoreData).forEach(key => {
        if (firestoreData[key] !== undefined) {
          finalData[key] = firestoreData[key];
        }
      });

      const messagesCollection = this.getUserMessagesCollection(userId);
      console.log('💾 ChatService: Saving bot message to Firestore:', {
        content: finalData.content,
        contentLength: finalData.content?.length || 0,
        sender: finalData.sender,
        userId: finalData.userId
      });
      const docRef = await messagesCollection.add(finalData);
      console.log('💾 ChatService: Bot message saved with ID:', docRef.id);

      const savedMessage: ChatMessage = {
        ...botMessage,
        id: docRef.id,
      };

      // Update conversation thread
      await this.updateConversationThread(userId, savedMessage);

      return savedMessage;
    } catch (error: any) {
      console.error('ChatService addBotMessage error:', error);
      throw this.handleFirestoreError(error, 'add bot message');
    }
  }

  /**
   * Update or create conversation thread
   */
  private async updateConversationThread(userId: string, _message: ChatMessage): Promise<void> {
    try {
      // Verify authentication
      this.verifyAuth(userId);
      
      const conversationsCollection = this.getUserConversationsCollection(userId);
      const conversationId = 'main'; // Single conversation per user for now

      const conversationRef = conversationsCollection.doc(conversationId);
      const conversationDoc = await conversationRef.get();

      if (conversationDoc.exists()) {
        // Update existing conversation
        const data = conversationDoc.data();
        const currentMessageCount = data?.messageCount || 0;
        
        await conversationRef.update({
          lastMessageAt: firestore.FieldValue.serverTimestamp(),
          messageCount: currentMessageCount + 1,
          isArchived: false, // Unarchive if new message arrives
        });

        // Check if we need to archive old messages
        if (currentMessageCount >= environmentConfig.MAX_CONVERSATION_HISTORY) {
          await this.archiveOldMessages(userId);
        }
      } else {
        // Create new conversation - only include defined values
        const conversationData: any = {
          id: conversationId,
          userId,
          createdAt: firestore.FieldValue.serverTimestamp(),
          lastMessageAt: firestore.FieldValue.serverTimestamp(),
          isArchived: false,
          messageCount: 1,
        };

        // Remove any undefined values
        const cleanConversationData: any = {};
        Object.keys(conversationData).forEach(key => {
          if (conversationData[key] !== undefined) {
            cleanConversationData[key] = conversationData[key];
          }
        });

        await conversationRef.set(cleanConversationData);
      }
    } catch (error: any) {
      console.error('ChatService updateConversationThread error:', error);
      // Don't throw here as this is a secondary operation
    }
  }

  /**
   * Archive old messages when conversation exceeds limit
   */
  private async archiveOldMessages(userId: string): Promise<void> {
    try {
      // Verify authentication
      this.verifyAuth(userId);
      
      const messagesCollection = this.getUserMessagesCollection(userId);
      // Get all messages ordered by timestamp (newest first)
      const snapshot = await messagesCollection
        .orderBy('timestamp', 'desc')
        .get();

      // Archive messages beyond the limit (skip first MAX_CONVERSATION_HISTORY messages)
      const messagesToArchive = snapshot.docs.slice(environmentConfig.MAX_CONVERSATION_HISTORY);

      // Archive messages in batches
      const batch = firestore().batch();
      let batchCount = 0;

      messagesToArchive.forEach((doc) => {
        batch.update(doc.ref, { isArchived: true });
        batchCount++;

        // Firestore batch limit is 500 operations
        if (batchCount >= 500) {
          return;
        }
      });

      if (batchCount > 0) {
        await batch.commit();
        console.log(`Archived ${batchCount} old messages for user ${userId}`);
      }
    } catch (error: any) {
      console.error('ChatService archiveOldMessages error:', error);
      // Don't throw here as this is a maintenance operation
    }
  }

  /**
   * Get message count for a user
   */
  async getMessageCount(userId: string): Promise<number> {
    try {
      // Verify authentication
      this.verifyAuth(userId);
      
      const messagesCollection = this.getUserMessagesCollection(userId);
      const snapshot = await messagesCollection
        .where('isArchived', '!=', true)
        .get();
      
      return snapshot.size;
    } catch (error: any) {
      console.error('ChatService getMessageCount error:', error);
      return 0;
    }
  }

  /**
   * Clear conversation history (for testing or user request)
   */
  async clearConversationHistory(userId: string): Promise<void> {
    try {
      // Verify authentication
      this.verifyAuth(userId);
      
      const messagesCollection = this.getUserMessagesCollection(userId);
      const snapshot = await messagesCollection.get();

      // Delete messages in batches
      const batch = firestore().batch();
      let batchCount = 0;

      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
        batchCount++;

        if (batchCount >= 500) {
          return;
        }
      });

      if (batchCount > 0) {
        await batch.commit();
      }

      // Clear conversation thread
      const conversationRef = this.getUserConversationsCollection(userId).doc('main');
      await conversationRef.delete();

      console.log(`Cleared conversation history for user ${userId}`);
    } catch (error: any) {
      console.error('ChatService clearConversationHistory error:', error);
      throw new Error(`Failed to clear conversation history: ${error.message}`);
    }
  }
}

// Export singleton instance
export const chatService = new ChatService();