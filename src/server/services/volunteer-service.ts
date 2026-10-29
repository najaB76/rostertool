import { db } from '../db/client.js';
import { volunteers, applicationSources, stayReviews, shiftAssignments } from '../db/schema.js';
import { eq, and, gt } from 'drizzle-orm';
import crypto from 'crypto';

export class VolunteerService {
  async getVolunteers(status?: string) {
    const query = db.select({
      volunteer: volunteers,
      sourceName: applicationSources.name
    })
    .from(volunteers)
    .leftJoin(applicationSources, eq(volunteers.applicationSourceId, applicationSources.id));

    if (status) {
      query.where(eq(volunteers.status, status));
    }

    const rows = await query;
    return rows.map(r => ({
      ...r.volunteer,
      applicationSourceName: r.sourceName
    }));
  }

  async getVolunteerById(id: string) {
    const row = await db.select({
      volunteer: volunteers,
      sourceName: applicationSources.name
    })
    .from(volunteers)
    .leftJoin(applicationSources, eq(volunteers.applicationSourceId, applicationSources.id))
    .where(eq(volunteers.id, id))
    .get();

    if (!row) return null;
    return { ...row.volunteer, applicationSourceName: row.sourceName };
  }

  async createVolunteer(data: any) {
    const id = crypto.randomUUID();
    const token = crypto.randomBytes(32).toString('hex');
    
    let sourceId: string | null = null;
    if (data.applicationSourceName) {
       const source = await db.select().from(applicationSources).where(eq(applicationSources.name, data.applicationSourceName)).get();
       if (source) {
         sourceId = source.id;
       } else {
         const newSourceId = crypto.randomUUID();
         await db.insert(applicationSources).values({ id: newSourceId, name: data.applicationSourceName });
         sourceId = newSourceId;
       }
    }

    await db.insert(volunteers).values({
      id,
      fullName: data.fullName,
      preferredName: data.preferredName || null,
      dateOfBirth: data.dateOfBirth || null,
      email: data.email,
      phone: data.phone,
      nationality: data.nationality,
      arrivalDate: data.arrivalDate,
      departureDate: data.departureDate,
      primaryRole: data.primaryRole || 'Housekeeping',
      applicationSourceId: sourceId,
      magicLinkToken: token,
      notes: data.notes
    });

    return this.getVolunteerById(id);
  }

  async updateVolunteer(id: string, data: any) {
    let sourceId: string | null = undefined as any;
    if (data.applicationSourceName) {
       const source = await db.select().from(applicationSources).where(eq(applicationSources.name, data.applicationSourceName)).get();
       if (source) {
         sourceId = source.id;
       } else {
         const newSourceId = crypto.randomUUID();
         await db.insert(applicationSources).values({ id: newSourceId, name: data.applicationSourceName });
         sourceId = newSourceId;
       }
    }

    const updateData: any = {
      fullName: data.fullName,
      preferredName: data.preferredName !== undefined ? data.preferredName : undefined,
      dateOfBirth: data.dateOfBirth !== undefined ? data.dateOfBirth : undefined,
      email: data.email,
      phone: data.phone,
      nationality: data.nationality,
      status: data.status,
      arrivalDate: data.arrivalDate,
      departureDate: data.departureDate,
      primaryRole: data.primaryRole,
      isReceptionQualified: data.isReceptionQualified,
      isTrainer: data.isTrainer,
      inTraining: data.inTraining,
      futureAcceptance: data.futureAcceptance,
      notes: data.notes,
      updatedAt: new Date().toISOString()
    };

    if (sourceId !== undefined) {
      updateData.applicationSourceId = sourceId;
    }

    // Filter undefined
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    await db.update(volunteers).set(updateData).where(eq(volunteers.id, id));
    return this.getVolunteerById(id);
  }

  async getApplicationSources() {
    return await db.select().from(applicationSources).where(eq(applicationSources.isActive, 1));
  }

  async acceptVolunteer(id: string, data: { arrivalDate: string; departureDate: string; primaryRole?: string; notes?: string }) {
    const updateData: any = {
      status: 'Accepted',
      arrivalDate: data.arrivalDate,
      departureDate: data.departureDate,
      updatedAt: new Date().toISOString()
    };
    if (data.primaryRole) updateData.primaryRole = data.primaryRole;
    if (data.notes !== undefined) updateData.notes = data.notes;

    await db.update(volunteers).set(updateData).where(eq(volunteers.id, id));
    return this.getVolunteerById(id);
  }

  async activateVolunteer(id: string) {
    await db.update(volunteers).set({
      status: 'Active',
      updatedAt: new Date().toISOString()
    }).where(eq(volunteers.id, id));
    return this.getVolunteerById(id);
  }

  async cancelVolunteer(id: string, cancellationReason?: string) {
    const vol = await this.getVolunteerById(id);
    let updatedNotes = vol?.notes || '';
    if (cancellationReason) {
      updatedNotes = updatedNotes ? `${updatedNotes}\n[Cancellation]: ${cancellationReason}` : `[Cancellation]: ${cancellationReason}`;
    }

    // 1. Update status
    await db.update(volunteers).set({
      status: 'Cancelled',
      notes: updatedNotes,
      updatedAt: new Date().toISOString()
    }).where(eq(volunteers.id, id));

    // 2. Unassign any future shifts
    const today = new Date().toISOString().split('T')[0];
    await db.delete(shiftAssignments).where(and(eq(shiftAssignments.volunteerId, id), gt(shiftAssignments.date, today)));

    return this.getVolunteerById(id);
  }

  async resetToken(id: string) {
    const token = crypto.randomBytes(32).toString('hex');
    await db.update(volunteers).set({ magicLinkToken: token, updatedAt: new Date().toISOString() }).where(eq(volunteers.id, id));
    return token;
  }

  async departVolunteer(id: string, rating: number, reviewNotes: string, futureAcceptanceRecommendation: string) {
    // 1. Update status
    await db.update(volunteers).set({
      status: 'Departed',
      futureAcceptance: futureAcceptanceRecommendation,
      updatedAt: new Date().toISOString()
    }).where(eq(volunteers.id, id));

    // 2. Unassign future shifts
    const today = new Date().toISOString().split('T')[0];
    await db.delete(shiftAssignments).where(and(eq(shiftAssignments.volunteerId, id), gt(shiftAssignments.date, today)));

    // 3. Create review
    await db.insert(stayReviews).values({
      id: crypto.randomUUID(),
      volunteerId: id,
      rating,
      reviewNotes,
      futureAcceptanceRecommendation
    });
  }
}

export const volunteerService = new VolunteerService();
