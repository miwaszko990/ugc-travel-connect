'use client';

interface CampaignCardProps {
  campaign: {
    id: string;
    title: string;
    creator?: string;
    destination?: string;
    dates?: string;
    status: 'draft' | 'pending' | 'confirmed' | 'completed';
    budget?: string;
    imageUrl?: string;
  };
}

export default function CampaignCard({ campaign }: CampaignCardProps) {
  // Helper function to get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'draft':
        return 'badge-neutral';
      case 'pending':
        return 'badge-warning';
      case 'confirmed':
        return 'badge-success';
      case 'completed':
        return 'badge-info';
      default:
        return 'badge-neutral';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-lg">{campaign.title}</h3>
          <span className={`badge ${getStatusBadgeClass(campaign.status)}`}>
            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
          </span>
        </div>
        
        {campaign.creator && (
          <div className="text-sm mb-2">
            <span className="text-gray-500">Creator:</span> {campaign.creator}
          </div>
        )}
        
        {campaign.destination && (
          <div className="text-sm mb-2">
            <span className="text-gray-500">Destination:</span> {campaign.destination}
          </div>
        )}
        
        {campaign.dates && (
          <div className="text-sm mb-2">
            <span className="text-gray-500">Dates:</span> {campaign.dates}
          </div>
        )}
        
        {campaign.budget && (
          <div className="text-sm mb-2">
            <span className="text-gray-500">Budget:</span> {campaign.budget}
          </div>
        )}
        
        <div className="flex justify-end mt-4">
          <button className="btn btn-sm btn-outline">Details</button>
        </div>
      </div>
    </div>
  );
}
