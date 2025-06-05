'use client';

import { useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { sendMessage, getConversationId } from '@/app/lib/firebase/messages';
import { toast } from 'react-hot-toast';
import { Dialog } from '@headlessui/react';
import { format } from 'date-fns';

interface Trip {
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  dateRange: string;
  status: string;
}

interface NewMessageModalProps {
  creatorId: string;
  creatorName: string;
  isOpen: boolean;
  onClose: () => void;
  initialMessage?: string;
  trips?: Trip[]; // Array of all available trips
}

export default function NewMessageModal({ 
  creatorId, 
  creatorName, 
  isOpen, 
  onClose,
  initialMessage = '',
  trips
}: NewMessageModalProps) {
  const [message, setMessage] = useState(initialMessage);
  const [sending, setSending] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [selectedTripIndex, setSelectedTripIndex] = useState<number | null>(null);
  const { user } = useAuth();
  
  if (!isOpen) return null;
  
  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-xl font-bold mb-4">Sign in Required</h3>
          <p className="mb-4">You need to sign in to send messages to creators.</p>
          <div className="flex justify-end">
            <button className="btn btn-ghost" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Only allow brands to send messages
  if (user.role !== 'brand') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-xl font-bold mb-4">Messaging Restricted</h3>
          <p className="mb-4">Only brands can send messages to creators.</p>
          <div className="flex justify-end">
            <button className="btn btn-ghost" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  const handleSend = async () => {
    if (!message.trim()) return;
    
    try {
      setSending(true);
      
      // Get sender name from user data
      const senderName = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}`
        : user.email || 'Anonymous User';
      
      // Create conversationId
      const conversationId = getConversationId(user.uid, creatorId);
      
      // Prepend trip context to message if trip is provided
      let fullMessage = message;
      if (trips && trips.length > 0 && selectedTripIndex !== null) {
        const trip = trips[selectedTripIndex];
        const fromDate = format(new Date(trip.startDate), 'MMM d');
        const toDate = format(new Date(trip.endDate), 'MMM d, yyyy');
        const tripHeader = `🛫 ${trip.destination}, ${trip.country} - ${fromDate} – ${toDate}`;
        fullMessage = `${tripHeader}\n\n${message}`;
      }
      
      // Send the message (this will also create the conversation if it doesn't exist)
      await sendMessage(
        user.uid, 
        creatorId, 
        fullMessage, 
        senderName,
        user.profileImageUrl // This will be undefined if not present
      );
      
      toast.success('Message sent! Check your inbox for replies.');
      setMessageSent(true);
      setMessage('');
      // Auto-close after 2 seconds
      setTimeout(() => {
        setMessageSent(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      <Dialog.Panel className="bg-white rounded-xl p-6 w-full max-w-md z-10 mx-4 shadow-2xl">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Message {creatorName}</h3>
        
        {/* Trip Selection */}
        {trips && trips.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Which trip are you interested in?
            </label>
            <select 
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-red-burgundy focus:ring-2 focus:ring-red-burgundy/20 transition-colors"
              value={selectedTripIndex ?? -1}
              onChange={(e) => setSelectedTripIndex(Number(e.target.value) === -1 ? null : Number(e.target.value))}
            >
              <option value={-1}>💬 General inquiry (no specific trip)</option>
              {trips.map((trip, index) => (
                <option key={index} value={index}>
                  🛫 {trip.destination}, {trip.country} - {trip.dateRange}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {/* Trip Context Display */}
        {trips && trips.length > 0 && selectedTripIndex !== null && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <span className="text-lg">🛫</span>
              <span className="font-medium text-sm">
                Messaging about: {trips[selectedTripIndex || 0].destination}, {format(new Date(trips[selectedTripIndex || 0].startDate), 'MMM d')} – {format(new Date(trips[selectedTripIndex || 0].endDate), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        )}
        
        {messageSent ? (
          <div className="text-green-600 font-semibold py-4">
            Message sent! Check your inbox for replies.
          </div>
        ) : (
          <>
            <textarea 
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 h-32 focus:border-red-burgundy focus:ring-2 focus:ring-red-burgundy/20 resize-none transition-colors"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
            />
            <div className="flex justify-end gap-3">
              <button 
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors" 
                onClick={onClose}
                disabled={sending}
              >
                Cancel
              </button>
              <button 
                className="bg-red-burgundy text-white px-6 py-2 rounded-lg font-medium hover:bg-red-burgundy/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                onClick={handleSend}
                disabled={sending || !message.trim()}
              >
                {sending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-r-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </button>
            </div>
          </>
        )}
      </Dialog.Panel>
    </Dialog>
  );
} 