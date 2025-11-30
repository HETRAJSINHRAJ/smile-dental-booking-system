'use client';

import { useEffect, useState } from 'react';
import { Star, Check, X, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { collection, query, where, orderBy, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Review } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import reviewService from '@/lib/reviews/reviewService';
import { useAuth } from '@/contexts/AuthContext';

export default function ReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [response, setResponse] = useState('');
  const [isResponding, setIsResponding] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [filter]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const reviewsRef = collection(db, 'reviews');
      let q;

      if (filter === 'all') {
        q = query(reviewsRef, orderBy('createdAt', 'desc'));
      } else {
        q = query(
          reviewsRef,
          where('status', '==', filter),
          orderBy('createdAt', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Review[];

      setReviews(data);
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (review: Review) => {
    try {
      await reviewService.approveReview(
        review.id, 
        review.providerId,
        user?.uid,
        user?.displayName || user?.email || 'Admin',
        user?.email || ''
      );
      toast.success('Review approved and provider rating updated');
      loadReviews();
    } catch (error) {
      toast.error('Failed to approve review');
    }
  };

  const handleReject = async (review: Review) => {
    try {
      await reviewService.rejectReview(
        review.id, 
        review.providerId,
        user?.uid,
        user?.displayName || user?.email || 'Admin',
        user?.email || ''
      );
      toast.success('Review rejected and provider rating updated');
      loadReviews();
    } catch (error) {
      toast.error('Failed to reject review');
    }
  };

  const handleRespond = async () => {
    if (!selectedReview || !response.trim()) return;

    setIsResponding(true);
    try {
      await reviewService.addResponse(selectedReview.id, response, 'Admin'); // TODO: Get actual admin name

      toast.success('Response added successfully');
      setSelectedReview(null);
      setResponse('');
      loadReviews();
    } catch (error) {
      toast.error('Failed to add response');
    } finally {
      setIsResponding(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Review Management</h1>
        <p className="text-gray-600 mt-2">Moderate and respond to patient reviews</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            onClick={() => setFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </Card>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">No reviews found</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{review.userName}</h3>
                    <Badge
                      variant={
                        review.status === 'approved'
                          ? 'default'
                          : review.status === 'rejected'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {review.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Provider: {review.providerName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(review.createdAt.toDate(), {
                      addSuffix: true,
                    })}
                  </p>
                </div>

                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= review.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-gray-700 mb-4">{review.comment}</p>

              {review.response && (
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <p className="text-sm font-semibold text-blue-900 mb-1">
                    Response from {review.respondedBy}
                  </p>
                  <p className="text-sm text-blue-800">{review.response}</p>
                </div>
              )}

              <div className="flex gap-2">
                {review.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(review)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(review)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </>
                )}

                {review.status === 'approved' && !review.response && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedReview(review)}
                  >
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Respond
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Response Dialog */}
      <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respond to Review</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedReview && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold mb-2">{selectedReview.userName}</p>
                <div className="flex mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= selectedReview.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-700">{selectedReview.comment}</p>
              </div>
            )}

            <div>
              <Textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Write your response..."
                rows={5}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedReview(null);
                  setResponse('');
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleRespond} disabled={isResponding || !response.trim()}>
                {isResponding ? 'Sending...' : 'Send Response'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
