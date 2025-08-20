import { gql } from "@apollo/client";

export const MESSAGES_SUBSCRIPTION = gql`
  subscription Messages($chatId: uuid!) {
    messages(
      where: { chat_id: { _eq: $chatId }, is_bot: { _eq: true } }
      order_by: { created_at: asc }
    ) {
      id
      content
      is_bot
      created_at
    }
  }
`;
