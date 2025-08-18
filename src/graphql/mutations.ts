import { gql } from '@apollo/client';

export const CREATE_CHAT = gql`
  mutation CreateChat($title: String!) {
    insert_chats_one(object: { title: $title }) {
      id
      title
      created_at
    }
  }
`;

export const INSERT_MESSAGE = gql`
  mutation InsertMessage($chatId: uuid!, $content: String!) {
    insert_messages_one(object: { chat_id: $chatId, content: $content, is_bot: false }) {
      id
      content
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