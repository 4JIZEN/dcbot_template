const { createClient } = require("@supabase/supabase-js");
const _supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

module.exports.getLastSeason = async function () {
    const { data, error } = await _supabase
        .from("seasons")
        .select("*")
        .order("id", { ascending: false })
        .limit(1);

    return data[0];
};

module.exports.hasRegister = async function (steam_id, discord_id, season_id) {
    const { data, error } = await _supabase
        .from("players")
        .select("id")
        .eq("season_id", season_id)
        .or(`steam_id.eq.${steam_id}, discord_id.eq.${discord_id}`)

    return data.length && true;
};

module.exports.playerRegister = async function (
    steam_id,
    discord_id,
    season_id
) {
    try {
        await _supabase.from("players").insert({
            steam_id: steam_id,
            discord_id: discord_id,
            season_id: season_id,
        });
    } catch (error) {
        console.log(error);
    }
};
