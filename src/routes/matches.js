import {Router } from 'express';
import { createMatchSchema ,listMatchesQuerySchema} from '../validation/matches.js';
import { db } from '../db/db.js';
import { matches } from '../db/schema.js';
import { getMatchStatus  } from '../utils/match-status.js';
import { desc } from 'drizzle-orm';

const matchesRouter=    Router();
const MAX_LIMIT = 100;
matchesRouter.get('/', async(req, res) => {
    const parsed = listMatchesQuerySchema.safeParse(req.query);
    if (!parsed.success) {
        return res.status(400).json({ errors: parsed.error.issues });
    }
    const limit= Math.min(parsed.data.limit ?? 50, MAX_LIMIT);
    try{

        const data = await db.select().from(matches).orderBy((desc(matches.createdAt))).limit(limit);
        res.json({ matches: data });

    }catch(error){
        res.status(500).json({ error: 'Internal server error',errorMessage:error.message });
    }
    
   
});

matchesRouter.post('/',async (req, res) => {
        const parsed = createMatchSchema.safeParse(req.body);
        const {data:{startTime, endTime,homeScore,awayScore}} = parsed;
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.issues });
        }

    try {

        // Process the valid match data
        const [event]= await db.insert(matches).values({
            ...parsed.data,
            startTime: new Date(startTime),
            endTime:new Date(endTime),
            homeScore: homeScore ?? 0,
            awayScore: awayScore ?? 0,
            status:getMatchStatus(startTime, endTime),
        }).returning();

        res.status(201).json({ message: 'Match created successfully', match: event})
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default matchesRouter;