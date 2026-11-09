import { db } from '../db/client.js';
import { volunteers, applicationSources, stayReviews, shiftAssignments, volunteerStays } from '../db/schema.js';
import { eq, and, gt, desc } from 'drizzle-orm';
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
    const allStays = await db.select().from(volunteerStays);

    const staysByVol = new Map<string, any[]>();
    for (const s of allStays) {
      if (!staysByVol.has(s.volunteerId)) {
        staysByVol.set(s.volunteerId, []);
      }
      staysByVol.get(s.volunteerId)!.push(s);
    }

    return rows.map(r => {
      const volStays = (staysByVol.get(r.volunteer.id) || []).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const latestStayWithReview = volStays.find(s => s.departureRating !== null);

      return {
        ...r.volunteer,
        applicationSourceName: r.sourceName,
        latestRating: latestStayWithReview?.departureRating ?? null,
        latestRehireStatus: latestStayWithReview?.rehireStatus ?? (r.volunteer.futureAcceptance || null),
        staysCount: volStays.length
      };
    });
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

    const stays = await db.select().from(volunteerStays)
      .where(eq(volunteerStays.volunteerId, id))
      .orderBy(desc(volunteerStays.createdAt));

    const latestStayWithReview = stays.find(s => s.departureRating !== null);

    return {
      ...row.volunteer,
      applicationSourceName: row.sourceName,
      latestRating: latestStayWithReview?.departureRating ?? null,
      latestRehireStatus: latestStayWithReview?.rehireStatus ?? (row.volunteer.futureAcceptance || null),
      staysCount: stays.length,
      stays
    };
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
      gender: data.gender || 'Unspecified',
      source: data.source || data.applicationSourceName || 'Other',
      arrivalDate: data.arrivalDate || null,
      departureDate: data.noEndDate ? null : (data.departureDate || null),
      noEndDate: Boolean(data.noEndDate),
      primaryRole: data.primaryRole || 'Housekeeping',
      isReceptionQualified: Boolean(data.isReceptionQualified),
      isTrainer: Boolean(data.isTrainer),
      inTraining: Boolean(data.inTraining),
      applicationSourceId: sourceId,
      magicLinkToken: token,
      notes: data.notes
    });

    if (data.arrivalDate) {
      await db.insert(volunteerStays).values({
        id: crypto.randomUUID(),
        volunteerId: id,
        arrivalDate: data.arrivalDate,
        departureDate: data.noEndDate ? null : (data.departureDate || null),
        noEndDate: Boolean(data.noEndDate),
        departureNotes: data.notes || null
      });
    }

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
      gender: data.gender !== undefined ? data.gender : undefined,
      source: data.source !== undefined ? data.source : undefined,
      status: data.status,
      arrivalDate: data.arrivalDate !== undefined ? data.arrivalDate : undefined,
      departureDate: data.noEndDate ? null : (data.departureDate !== undefined ? data.departureDate : undefined),
      noEndDate: data.noEndDate !== undefined ? Boolean(data.noEndDate) : undefined,
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

  async acceptVolunteer(id: string, data: { arrivalDate: string; departureDate?: string; noEndDate?: boolean; primaryRole?: string; notes?: string }) {
    const updateData: any = {
      status: 'Accepted',
      arrivalDate: data.arrivalDate,
      departureDate: data.noEndDate ? null : (data.departureDate || null),
      noEndDate: Boolean(data.noEndDate),
      updatedAt: new Date().toISOString()
    };
    if (data.primaryRole) updateData.primaryRole = data.primaryRole;
    if (data.notes !== undefined) updateData.notes = data.notes;

    await db.update(volunteers).set(updateData).where(eq(volunteers.id, id));

    // Ensure stay record exists
    const existingStays = await db.select().from(volunteerStays).where(eq(volunteerStays.volunteerId, id));
    if (existingStays.length === 0) {
      await db.insert(volunteerStays).values({
        id: crypto.randomUUID(),
        volunteerId: id,
        arrivalDate: data.arrivalDate,
        departureDate: data.noEndDate ? null : (data.departureDate || null),
        noEndDate: Boolean(data.noEndDate),
        departureNotes: data.notes || null
      });
    }

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

    await db.update(volunteers).set({
      status: 'Cancelled',
      notes: updatedNotes,
      updatedAt: new Date().toISOString()
    }).where(eq(volunteers.id, id));

    const today = new Date().toISOString().split('T')[0];
    await db.delete(shiftAssignments).where(and(eq(shiftAssignments.volunteerId, id), gt(shiftAssignments.date, today)));

    return this.getVolunteerById(id);
  }

  async resetToken(id: string) {
    const token = crypto.randomBytes(32).toString('hex');
    await db.update(volunteers).set({ magicLinkToken: token, updatedAt: new Date().toISOString() }).where(eq(volunteers.id, id));
    return token;
  }

  async departVolunteer(id: string, departureRating: number, departureNotes?: string, rehireStatus: string = 'Accept') {
    const vol = await db.select().from(volunteers).where(eq(volunteers.id, id)).get();
    if (!vol) throw new Error('Volunteer not found');

    const today = new Date().toISOString().split('T')[0];

    // 1. Update volunteer status
    await db.update(volunteers).set({
      status: 'Departed',
      futureAcceptance: rehireStatus,
      updatedAt: new Date().toISOString()
    }).where(eq(volunteers.id, id));

    // 2. Unassign future shifts
    await db.delete(shiftAssignments).where(and(eq(shiftAssignments.volunteerId, id), gt(shiftAssignments.date, today)));

    // 3. Update or create stay review in volunteer_stays
    const latestStay = await db.select().from(volunteerStays)
      .where(eq(volunteerStays.volunteerId, id))
      .orderBy(desc(volunteerStays.createdAt))
      .get();

    if (latestStay) {
      await db.update(volunteerStays).set({
        departureRating,
        departureNotes: departureNotes || null,
        rehireStatus,
        departureDate: latestStay.departureDate || today
      }).where(eq(volunteerStays.id, latestStay.id));
    } else {
      await db.insert(volunteerStays).values({
        id: crypto.randomUUID(),
        volunteerId: id,
        arrivalDate: vol.arrivalDate || today,
        departureDate: vol.departureDate || today,
        noEndDate: vol.noEndDate || false,
        departureRating,
        departureNotes: departureNotes || null,
        rehireStatus
      });
    }

    // Keep legacy stayReviews populated for backward compatibility
    await db.insert(stayReviews).values({
      id: crypto.randomUUID(),
      volunteerId: id,
      rating: departureRating,
      reviewNotes: departureNotes || '',
      futureAcceptanceRecommendation: rehireStatus
    });

    return this.getVolunteerById(id);
  }

  async reactivateVolunteer(id: string, data: { arrivalDate: string; departureDate?: string | null; noEndDate?: boolean }) {
    const vol = await db.select().from(volunteers).where(eq(volunteers.id, id)).get();
    if (!vol) throw new Error('Volunteer not found');

    const updateData: any = {
      status: 'Active',
      arrivalDate: data.arrivalDate,
      departureDate: data.noEndDate ? null : (data.departureDate || null),
      noEndDate: Boolean(data.noEndDate),
      updatedAt: new Date().toISOString()
    };

    await db.update(volunteers).set(updateData).where(eq(volunteers.id, id));

    // Insert new stay record
    await db.insert(volunteerStays).values({
      id: crypto.randomUUID(),
      volunteerId: id,
      arrivalDate: data.arrivalDate,
      departureDate: data.noEndDate ? null : (data.departureDate || null),
      noEndDate: Boolean(data.noEndDate)
    });

    return this.getVolunteerById(id);
  }

  async getVolunteerStays(volunteerId: string) {
    return await db.select().from(volunteerStays)
      .where(eq(volunteerStays.volunteerId, volunteerId))
      .orderBy(desc(volunteerStays.createdAt));
  }
}

export const volunteerService = new VolunteerService();
