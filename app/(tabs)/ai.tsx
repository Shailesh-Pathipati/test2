import React from 'react';
import EnhancedAIAssistant from '@/components/EnhancedAIAssistant';

export default function AIScreen() {
  // In a real app, you would get these from user context/state
  const userEquipment = ['CAT12345', 'CAT67890'];
  const userId = 'user123';

  return (
    <EnhancedAIAssistant 
      userEquipment={userEquipment}
      userId={userId}
    />
  );
}