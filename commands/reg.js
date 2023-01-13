const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const SteamID = require("steamid");
const {
    getLastSeason,
    hasRegister,
    playerRegister,
} = require("../libs/supabase.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("reg")
        .setDescription("Register to scum")
        .addStringOption((option) =>
            option
                .setName("steam_id")
                .setDescription("สตีมไอดี")
                .setRequired(true)
        ),
    async execute(interaction) {
        try {
            const raw = interaction.options.getString("steam_id");
            const role = interaction.guild.roles.cache.find(
                (item) => item.name === "Player"
            );

            if (raw.length !== 17) {
                return await interaction.reply({
                    content: "หมายเลขสตีมไอดีไม่ถูกต้อง!!!",
                    ephemeral: true,
                });
            }

            const sid = new SteamID(raw);

            if (!sid.isValidIndividual()) {
                return await interaction.reply({
                    content: "หมายเลขสตีมไอดีไม่ถูกต้อง!!!",
                    ephemeral: true,
                });
            }

            const season = await getLastSeason();
            const discord_id = interaction.user.id;
            const steam_id = sid.getSteamID64();
            const hasRegis = await hasRegister(steam_id, discord_id, season.id);

            if (hasRegis) {
                return await interaction.reply({
                    content: "สตีมไอดี/ดิสคอร์ดนี้ ลงทะเบียนไปแล้ว",
                    ephemeral: true,
                });
            }

            interaction.member.roles
                .add(role)
                .then(async () => {
                    await interaction.reply({
                        content: `ลงทะเบียนสำเร็จ ได้รบยศ ${role.name} แล้ว`,
                        ephemeral: true,
                    });
                })
                .then(async () => {
                    await playerRegister(steam_id, discord_id, season.id);
                })
                .catch(async (error) => {
                    console.error(error);
                    await interaction.reply({
                        content: `[1] เกิดข้อผิดพลาด ติดต่อแอดมิน`,
                        ephemeral: true,
                    });
                });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: `[2] เกิดข้อผิดพลาด ติดต่อแอดมิน`,
                ephemeral: true,
            });
        }
    },
};
