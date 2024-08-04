require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
  ],
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);

  // Register the command
  const command = new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Bans a member from the server.")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("The user to ban")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason for the ban")
        .setRequired(true),
    );

  client.application.commands.create(command);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ban") {
    const target = interaction.options.getUser("target");
    const reason = interaction.options.getString("reason");

    try {
      await interaction.guild.members.ban(target, { reason: reason });
      await interaction.reply(`Banned ${target.tag} for: ${reason}`);
    } catch (error) {
      console.error("Error banning user:", error);
      await interaction.reply(
        "Failed to ban user. Make sure I have the necessary permissions.",
      );
    }
  }
});

client.login(
  process.env.MTI2OTQ3Njc5OTI3NzA0MzgxMg.GKKBQQ
    .Oj7st5GbPz2_Tgphmx06YRPdfyQnxOkpmNBdB8,
);
