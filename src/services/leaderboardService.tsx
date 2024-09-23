// services/leaderboardService.ts
import supabase from '../services/supabaseClient';
import { GameLogDataEntries } from '../components/LeaderBoard';

export const fetchLeaderboardData = async (): Promise<GameLogDataEntries[]> => {
  try {
    const { data, error } = await supabase
      .from('userscore') // Replace 'userscore' with your actual table name
      .select('*');

    if (error) {
      throw new Error(`SupaBase error: ${error.message}`);
    }

    return data as GameLogDataEntries[];
  } catch (error) {
    console.error('Error fetching Leaderboard Data:', error);
    return [];
  }
};
