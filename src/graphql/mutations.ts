import { gql } from '@apollo/client';

export const CREATE_CHAT = gql`
  mutation CreateChat($title: String!, $userId: uuid!) {
    insert_chats_one(object: { title: $title, user_id: $userId }) {
      id
      title
      created_at
    }
  }
`;

export const INSERT_MESSAGE = gql`
  mutation InsertUserMessage($chatId: uuid!, $content: String!, $isBot: Boolean = false) {
    insert_messages_one(object: { 
      chat_id: $chatId, 
      content: $content, 
      is_bot: $isBot
    }) {
      id
      chat_id
      content
      is_bot
      created_at
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation SendMessage($chatId: uuid!, $content: String!) {
    sendMessage(chatId: $chatId, content: $content) {
      message
    }
  }
`;