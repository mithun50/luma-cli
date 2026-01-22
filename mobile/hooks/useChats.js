// Chats Hook - Multichat management with error handling
import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services';
import { AppError, wrapError } from '../utils';

export function useChats(isConnected) {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Start as loading
  const [hasLoaded, setHasLoaded] = useState(false); // Track if initial load done
  const [error, setError] = useState(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
    retryCountRef.current = 0;
  }, []);

  // Fetch all chats with error handling
  const fetchChats = useCallback(async (isInitial = false) => {
    if (!isConnected) return;

    // Always show loading for initial fetch, optional for subsequent
    if (isInitial || !hasLoaded) {
      setIsLoading(true);
    }

    try {
      const result = await api.getChats();
      if (result.error) {
        throw new Error(result.error);
      }
      if (result.chats) {
        setChats(result.chats);
        if (result.activeChat) {
          setActiveChat(result.activeChat);
        }
        setError(null);
        retryCountRef.current = 0;
      }
      setHasLoaded(true);
    } catch (err) {
      const appError = err instanceof AppError ? err : wrapError(err);
      console.warn('Failed to fetch chats:', appError.message);

      // Always set error so UI knows fetch failed
      setError({
        message: appError.message || 'Failed to load chats',
        title: appError.title || 'Chat Error',
        retryable: appError.retryable !== false,
        category: appError.category || 'unknown',
      });
      setHasLoaded(true); // Mark as loaded even on error
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, hasLoaded]);

  // Initial fetch
  useEffect(() => {
    if (isConnected) {
      fetchChats(true); // Initial fetch
    } else {
      // Reset all state when disconnected
      setChats([]);
      setActiveChat(null);
      setError(null);
      setHasLoaded(false);
      setIsLoading(true); // Ready for next connection
    }
  }, [isConnected]); // Remove fetchChats dependency to avoid loops

  // Create new chat with error handling
  const createChat = useCallback(async (name = '') => {
    if (!isConnected) {
      return {
        error: 'Not connected to server',
        retryable: true,
      };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await api.createChat(name);

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.success || result.chat) {
        await fetchChats(false);
        setIsLoading(false);
        return { success: true, chat: result.chat };
      }

      setIsLoading(false);
      return result;
    } catch (err) {
      const appError = err instanceof AppError ? err : wrapError(err);
      console.warn('Failed to create chat:', appError.message);

      const errorInfo = {
        error: appError.message || 'Failed to create chat',
        title: 'Create Chat Failed',
        retryable: appError.retryable !== false,
      };

      setError(errorInfo);
      setIsLoading(false);
      return errorInfo;
    }
  }, [isConnected, fetchChats]);

  // Switch to a chat with error handling
  const switchChat = useCallback(async (chatId) => {
    if (!isConnected) {
      return {
        error: 'Not connected to server',
        retryable: true,
      };
    }

    if (!chatId) {
      return { error: 'Invalid chat ID' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await api.switchChat(chatId);

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.success) {
        setActiveChat(chatId);
        await fetchChats(false);
      }

      setIsLoading(false);
      return { success: true };
    } catch (err) {
      const appError = err instanceof AppError ? err : wrapError(err);
      console.warn('Failed to switch chat:', appError.message);

      const errorInfo = {
        error: appError.message || 'Failed to switch chat',
        title: 'Switch Chat Failed',
        retryable: appError.retryable !== false,
      };

      setError(errorInfo);
      setIsLoading(false);
      return errorInfo;
    }
  }, [isConnected, fetchChats]);

  // Delete a chat with error handling
  const deleteChat = useCallback(async (chatId) => {
    if (!isConnected) {
      return {
        error: 'Not connected to server',
        retryable: true,
      };
    }

    if (!chatId) {
      return { error: 'Invalid chat ID' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await api.deleteChat(chatId);

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.success) {
        // If we deleted the active chat, clear it
        if (chatId === activeChat) {
          setActiveChat(null);
        }
        await fetchChats(false);
      }

      setIsLoading(false);
      return { success: true };
    } catch (err) {
      const appError = err instanceof AppError ? err : wrapError(err);
      console.warn('Failed to delete chat:', appError.message);

      const errorInfo = {
        error: appError.message || 'Failed to delete chat',
        title: 'Delete Chat Failed',
        retryable: appError.retryable !== false,
      };

      setError(errorInfo);
      setIsLoading(false);
      return errorInfo;
    }
  }, [isConnected, fetchChats, activeChat]);

  // Rename a chat with error handling
  const renameChat = useCallback(async (chatId, name) => {
    if (!isConnected) {
      return {
        error: 'Not connected to server',
        retryable: true,
      };
    }

    if (!chatId || !name?.trim()) {
      return { error: 'Invalid chat ID or name' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await api.renameChat(chatId, name.trim());

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.success) {
        await fetchChats(false);
      }

      setIsLoading(false);
      return { success: true };
    } catch (err) {
      const appError = err instanceof AppError ? err : wrapError(err);
      console.warn('Failed to rename chat:', appError.message);

      const errorInfo = {
        error: appError.message || 'Failed to rename chat',
        title: 'Rename Chat Failed',
        retryable: appError.retryable !== false,
      };

      setError(errorInfo);
      setIsLoading(false);
      return errorInfo;
    }
  }, [isConnected, fetchChats]);

  // Refresh chats
  const refresh = useCallback(() => {
    return fetchChats(false);
  }, [fetchChats]);

  // Retry after error
  const retry = useCallback(() => {
    clearError();
    return fetchChats(false);
  }, [fetchChats, clearError]);

  return {
    chats,
    activeChat,
    isLoading,
    error,
    createChat,
    switchChat,
    deleteChat,
    renameChat,
    refresh,
    retry,
    clearError,
  };
}

export default useChats;
