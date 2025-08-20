import { gql } from '@apollo/client';

export const GET_CHATS = gql`
  query GetChats {
    chats(order_by: { created_at: desc }) {
      id
      title
      created_at
    }
  }
`;

export const GET_CHAT = gql`
  query GetChat($chatId: uuid!) {
    chats_by_pk(id: $chatId) {
      id
      title
      messages(order_by: { created_at: asc }) {
        id
        content
        is_bot
        created_at
      }
    }
  }
`;

export const GET_PREVIOUS_MESSAGES = gql`
  query GetPreviousMessages($chatId: uuid!) {
    messages(
      where: { chat_id: { _eq: $chatId } }
      order_by: { created_at: asc }
    ) {
      id
      content
      is_bot
      created_at
    }
  }
`;