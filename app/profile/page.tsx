"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Loader2, PencilLine } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { format } from 'date-fns';
import ProfileForm from '@/components/profile-form';
import UserReviews from '@/components/user-reviews';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { user, isAuthenticated, isLoading, fetchUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/profile');
    }
  }, [isAuthenticated, isLoading, router]);
  
  const handleProfileUpdate = async (updatedData) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      // Refresh user data
      await fetchUser();
      
      setIsEditing(false);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (isLoading || !user) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center mb-8">
          <Avatar className="w-24 h-24">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-xl">{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground">
              Joined {format(new Date(user.createdAt), 'MMMM yyyy')}
            </p>
          </div>
          
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => setIsEditing(!isEditing)}
          >
            <PencilLine className="h-4 w-4" />
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>
        
        <Separator className="mb-8" />
        
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6">
            {isEditing ? (
              <ProfileForm 
                user={user} 
                onSubmit={handleProfileUpdate} 
                isLoading={loading}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <h3 className="text-lg font-semibold">About</h3>
                  <p className="text-muted-foreground">
                    {user.bio || 'No bio provided yet.'}
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <h3 className="text-lg font-semibold">Email</h3>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
                
                {user.isAdmin && (
                  <div className="grid gap-2">
                    <h3 className="text-lg font-semibold">Role</h3>
                    <p className="text-muted-foreground">Administrator</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="reviews">
            <UserReviews userId={user.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}