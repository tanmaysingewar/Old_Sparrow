export const saveLocalMessages = (messages: any[], chatId: string) => {
  localStorage.setItem(`messages-${chatId}`, JSON.stringify(messages));
};

export const getLocalMessages = (chatId: string) => {
  const messages = localStorage.getItem(`messages-${chatId}`);
  return messages ? JSON.parse(messages) : [];
};
