/**
 * Admin Email Whitelist Management
 * 
 * This module handles the admin email whitelist stored in Firestore.
 * Only emails in this whitelist can access the admin portal.
 */

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

const WHITELIST_DOC_PATH = 'config/adminWhitelist';

export interface AdminWhitelist {
  emails: string[];
  updatedAt: any;
  updatedBy?: string;
}

/**
 * Check if an email is in the admin whitelist
 * @param email - Email address to check
 * @returns Promise<boolean> - True if email is whitelisted
 */
export async function isEmailWhitelisted(email: string): Promise<boolean> {
  try {
    console.log('🔍 Checking whitelist for email:', email);
    const normalizedEmail = email.toLowerCase().trim();
    console.log('📧 Normalized email:', normalizedEmail);
    console.log('📂 Fetching document from path:', WHITELIST_DOC_PATH);

    const whitelistDoc = await getDoc(doc(db, WHITELIST_DOC_PATH));

    if (!whitelistDoc.exists()) {
      console.warn('⚠️ Admin whitelist document does not exist. Creating default whitelist.');
      // Create default whitelist if it doesn't exist
      await initializeWhitelist([]);
      return false;
    }

    console.log('✅ Whitelist document exists');
    const whitelist = whitelistDoc.data() as AdminWhitelist;
    console.log('📋 Whitelist data:', whitelist);
    console.log('📧 Emails in whitelist:', whitelist.emails);

    const normalizedWhitelist = whitelist.emails.map(e => e.toLowerCase().trim());
    console.log('📧 Normalized whitelist:', normalizedWhitelist);

    const isWhitelisted = normalizedWhitelist.includes(normalizedEmail);
    console.log('✅ Is whitelisted?', isWhitelisted);

    return isWhitelisted;
  } catch (error) {
    console.error('❌ Error checking admin whitelist:', error);
    return false;
  }
}

/**
 * Get the current admin whitelist
 * @returns Promise<string[]> - Array of whitelisted email addresses
 */
export async function getAdminWhitelist(): Promise<string[]> {
  try {
    const whitelistDoc = await getDoc(doc(db, WHITELIST_DOC_PATH));
    
    if (!whitelistDoc.exists()) {
      return [];
    }

    const whitelist = whitelistDoc.data() as AdminWhitelist;
    return whitelist.emails || [];
  } catch (error) {
    console.error('Error fetching admin whitelist:', error);
    return [];
  }
}

/**
 * Initialize the admin whitelist (should be called once during setup)
 * @param emails - Initial list of admin emails
 * @returns Promise<void>
 */
export async function initializeWhitelist(emails: string[]): Promise<void> {
  try {
    const normalizedEmails = emails.map(e => e.toLowerCase().trim());
    
    await setDoc(doc(db, WHITELIST_DOC_PATH), {
      emails: normalizedEmails,
      updatedAt: new Date(),
      updatedBy: 'system'
    });
    
    console.log('Admin whitelist initialized successfully');
  } catch (error) {
    console.error('Error initializing admin whitelist:', error);
    throw error;
  }
}

/**
 * Add an email to the admin whitelist
 * @param email - Email address to add
 * @param updatedBy - UID of the admin making the change
 * @returns Promise<void>
 */
export async function addEmailToWhitelist(email: string, updatedBy: string): Promise<void> {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const currentWhitelist = await getAdminWhitelist();
    
    if (currentWhitelist.includes(normalizedEmail)) {
      console.log('Email already in whitelist:', normalizedEmail);
      return;
    }

    const updatedEmails = [...currentWhitelist, normalizedEmail];
    
    await setDoc(doc(db, WHITELIST_DOC_PATH), {
      emails: updatedEmails,
      updatedAt: new Date(),
      updatedBy
    });
    
    console.log('Email added to whitelist:', normalizedEmail);
  } catch (error) {
    console.error('Error adding email to whitelist:', error);
    throw error;
  }
}

/**
 * Remove an email from the admin whitelist
 * @param email - Email address to remove
 * @param updatedBy - UID of the admin making the change
 * @returns Promise<void>
 */
export async function removeEmailFromWhitelist(email: string, updatedBy: string): Promise<void> {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const currentWhitelist = await getAdminWhitelist();
    
    const updatedEmails = currentWhitelist.filter(e => e !== normalizedEmail);
    
    await setDoc(doc(db, WHITELIST_DOC_PATH), {
      emails: updatedEmails,
      updatedAt: new Date(),
      updatedBy
    });
    
    console.log('Email removed from whitelist:', normalizedEmail);
  } catch (error) {
    console.error('Error removing email from whitelist:', error);
    throw error;
  }
}

