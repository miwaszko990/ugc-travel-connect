'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { initializeConversation } from '@/app/lib/firebase/messages';
import { Spinner } from '@/app/components/ui/spinner';
import { toast } from 'react-hot-toast';

interface NewConversationButtonProps {
  targetUserId: string;
  targetUserRole: 'brand' | 'creator';
  buttonText?: string;
  className?: string;
  variant?: 'primary' | 'outline' | 'secondary' | 'small';
  onConversationCreated?: (conversationId: string) => void;
}

export default function NewConversationButton({
  targetUserId,
  targetUserRole,
  buttonText = 'Message',
  className = '',
  variant = 'primary',
  onConversationCreated
}: NewConversationButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!user) {
      toast.error('You must be logged in to send messages');
      return;
    }

    if (user.uid === targetUserId) {
      toast.error('You cannot message yourself');
      return;
    }

    try {
      setLoading(true);

      // Get current user info
      const currentUserDoc = await getDoc(doc(db, 'users', user.uid));
      if (!currentUserDoc.exists()) {
        toast.error('Your profile is not complete');
        return;
      }

      const currentUserData = currentUserDoc.data();
      const currentUserRole = currentUserData.role as 'brand' | 'creator';
      const currentUserName = currentUserRole === 'brand' 
        ? currentUserData.brandName 
        : `${currentUserData.firstName} ${currentUserData.lastName || ''}`.trim();
      
      // Get target user info
      const targetUserDoc = await getDoc(doc(db, 'users', targetUserId));
      if (!targetUserDoc.exists()) {
        toast.error('This user does not have a complete profile');
        return;
      }

      const targetUserData = targetUserDoc.data();
      const targetUserName = targetUserRole === 'brand' 
        ? targetUserData.brandName 
        : `${targetUserData.firstName} ${targetUserData.lastName || ''}`.trim();

      // Initialize the conversation
      const conversationId = await initializeConversation(
        user.uid,
        targetUserId,
        {
          name: currentUserName,
          profilePic: currentUserData.profileImageUrl || currentUserData.logoUrl,
          role: currentUserRole
        },
        {
          name: targetUserName,
          profilePic: targetUserData.profileImageUrl || targetUserData.logoUrl,
          role: targetUserRole
        }
      );

      // Invoke callback if provided
      if (onConversationCreated) {
        onConversationCreated(conversationId);
      } else {
        // Navigate to messages with this conversation selected
        const dashboardPath = currentUserRole === 'brand'
          ? '/dashboard'
          : '/dashboard/creator';
          
        router.push(`${dashboardPath}?tab=messages&conversation=${conversationId}`);
      }

      toast.success(`Chat with ${targetUserName} created!`);
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to start conversation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Determine button style based on variant
  const buttonStyles = {
    primary: 'btn btn-primary',
    outline: 'btn btn-outline',
    secondary: 'btn btn-secondary',
    small: 'btn btn-sm btn-primary'
  };

  const buttonStyle = buttonStyles[variant] || buttonStyles.primary;

  return (
    <button
      className={`btn btn-primary ${className}`}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? (
        <>
          <Spinner size="sm" className="mr-2" />
          Connecting...
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
              clipRule="evenodd"
            />
          </svg>
          {buttonText}
        </>
      )}
    </button>
  );
} // review trigger
