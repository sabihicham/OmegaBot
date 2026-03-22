import { Client, GatewayIntentBits, EmbedBuilder, Partials } from "discord.js";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, ref, get } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyCEdfKwVe-0jAcTzCGBcV80wB-LPNnYHsA",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "omegabot-4db3a.firebaseapp.com",
  databaseURL: process.env.FIREBASE_DATABASE_URL || "https://omegabot-4db3a-default-rtdb.firebaseio.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "omegabot-4db3a",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const database = getDatabase(app);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.GuildMember],
});

client.once("ready", () => {
  console.log(`✅ Bot is ready as ${client.user.tag}`);
  console.log(`📡 Serving ${client.guilds.cache.size} servers`);
  
  client.guilds.cache.forEach(guild => {
    guild.members.fetch().catch(() => {});
  });
});

client.on("guildCreate", (guild) => {
  console.log(`📥 Joined new server: ${guild.name}`);
  guild.members.fetch().catch(() => {});
});

// Welcome message
client.on("guildMemberAdd", async (member) => {
  console.log(`👋 Member joined: ${member.user.username} in ${member.guild.name}`);
  
  try {
    const configSnap = await get(ref(database, `guilds/${member.guild.id}/config`));
    const config = configSnap.val();

    if (!config?.welcome?.enabled) {
      console.log(`⚠️ Welcome not enabled for ${member.guild.name}`);
      return;
    }
    
    if (!config.welcome.channelId) {
      console.log(`⚠️ No welcome channel set for ${member.guild.name}`);
      return;
    }

    const channel = member.guild.channels.cache.get(config.welcome.channelId);
    if (!channel) {
      console.log(`⚠️ Welcome channel not found: ${config.welcome.channelId}`);
      return;
    }
    
    if (!channel.isTextBased()) {
      console.log(`⚠️ Welcome channel is not a text channel`);
      return;
    }

    const memberCount = member.guild.memberCount;

    let content = config.welcome.content || "";
    if (content) {
      content = content.replace(/{user}/g, `<@${member.id}>`);
      content = content.replace(/{username}/g, member.user.username);
      content = content.replace(/{server}/g, member.guild.name);
      content = content.replace(/{memberCount}/g, memberCount.toString());
    }

    const messageData = {};
    if (content) messageData.content = content;

    if (config.welcome.embedEnabled) {
      const embed = new EmbedBuilder();

      if (config.welcome.embedTitle) {
        embed.setTitle(
          config.welcome.embedTitle
            .replace(/{user}/g, member.user.username)
            .replace(/{server}/g, member.guild.name)
        );
      }

      if (config.welcome.embedDescription) {
        embed.setDescription(
          config.welcome.embedDescription
            .replace(/{user}/g, `<@${member.id}>`)
            .replace(/{username}/g, member.user.username)
            .replace(/{server}/g, member.guild.name)
            .replace(/{memberCount}/g, memberCount.toString())
        );
      }

      if (config.welcome.embedColor) {
        embed.setColor(parseInt(config.welcome.embedColor.replace("#", ""), 16));
      }

      if (config.welcome.embedThumbnail === "{avatar}") {
        embed.setThumbnail(member.user.displayAvatarURL({ size: 256 }));
      } else if (config.welcome.embedThumbnail) {
        embed.setThumbnail(config.welcome.embedThumbnail);
      }

      if (config.welcome.embedImage) {
        embed.setImage(config.welcome.embedImage);
      }

      if (config.welcome.embedFooter) {
        embed.setFooter({
          text: config.welcome.embedFooter.replace(/{memberCount}/g, memberCount.toString()),
        });
      }

      messageData.embeds = [embed];
    }

    if (!messageData.content && !messageData.embeds) {
      console.log(`⚠️ No welcome message content configured`);
      return;
    }

    await channel.send(messageData);
    console.log(`✅ Welcome message sent for ${member.user.username} in ${member.guild.name}`);
  } catch (error) {
    console.error("❌ Welcome error:", error.message);
  }
});

// Leave message
client.on("guildMemberRemove", async (member) => {
  console.log(`👋 Member left: ${member.user.username} in ${member.guild.name}`);
  
  try {
    const configSnap = await get(ref(database, `guilds/${member.guild.id}/config`));
    const config = configSnap.val();

    if (!config?.leave?.enabled) {
      console.log(`⚠️ Leave not enabled for ${member.guild.name}`);
      return;
    }
    
    if (!config.leave.channelId) {
      console.log(`⚠️ No leave channel set for ${member.guild.name}`);
      return;
    }

    const channel = member.guild.channels.cache.get(config.leave.channelId);
    if (!channel) {
      console.log(`⚠️ Leave channel not found: ${config.leave.channelId}`);
      return;
    }
    
    if (!channel.isTextBased()) {
      console.log(`⚠️ Leave channel is not a text channel`);
      return;
    }

    const memberCount = member.guild.memberCount;
    const user = member.user;

    let content = config.leave.content || "";
    if (content) {
      content = content.replace(/{user}/g, user.username);
      content = content.replace(/{username}/g, user.username);
      content = content.replace(/{server}/g, member.guild.name);
      content = content.replace(/{memberCount}/g, memberCount.toString());
    }

    const messageData = {};
    if (content) messageData.content = content;

    if (config.leave.embedEnabled) {
      const embed = new EmbedBuilder();

      if (config.leave.embedTitle) {
        embed.setTitle(
          config.leave.embedTitle
            .replace(/{user}/g, user.username)
            .replace(/{server}/g, member.guild.name)
        );
      }

      if (config.leave.embedDescription) {
        embed.setDescription(
          config.leave.embedDescription
            .replace(/{user}/g, user.username)
            .replace(/{username}/g, user.username)
            .replace(/{server}/g, member.guild.name)
            .replace(/{memberCount}/g, memberCount.toString())
        );
      }

      if (config.leave.embedColor) {
        embed.setColor(parseInt(config.leave.embedColor.replace("#", ""), 16));
      }

      if (config.leave.embedThumbnail === "{avatar}") {
        embed.setThumbnail(user.displayAvatarURL({ size: 256 }));
      } else if (config.leave.embedThumbnail) {
        embed.setThumbnail(config.leave.embedThumbnail);
      }

      if (config.leave.embedImage) {
        embed.setImage(config.leave.embedImage);
      }

      if (config.leave.embedFooter) {
        embed.setFooter({
          text: config.leave.embedFooter.replace(/{memberCount}/g, memberCount.toString()),
        });
      }

      messageData.embeds = [embed];
    }

    if (!messageData.content && !messageData.embeds) {
      console.log(`⚠️ No leave message content configured`);
      return;
    }

    await channel.send(messageData);
    console.log(`✅ Leave message sent for ${user.username} in ${member.guild.name}`);
  } catch (error) {
    console.error("❌ Leave error:", error.message);
  }
});

// Verification
client.on("messageReactionAdd", async (reaction, user) => {
  if (user.bot) return;

  try {
    if (reaction.partial) {
      await reaction.fetch();
    }
    if (reaction.message.partial) {
      await reaction.message.fetch();
    }

    const guild = reaction.message.guild;
    if (!guild) return;

    const configSnap = await get(ref(database, `guilds/${guild.id}/config`));
    const config = configSnap.val();

    if (!config?.verification?.enabled) {
      console.log(`⚠️ Verification not enabled for ${guild.name}`);
      return;
    }

    const messageChannelId = reaction.message.channel.id;
    const configChannelId = config.verification.channelId;
    
    if (messageChannelId !== configChannelId) {
      return;
    }

    const reactionEmoji = reaction.emoji.name;
    const configEmoji = config.verification.emoji;
    
    if (reactionEmoji !== configEmoji) {
      console.log(`⚠️ Emoji mismatch: ${reactionEmoji} !== ${configEmoji}`);
      return;
    }

    let member;
    try {
      member = await guild.members.fetch(user.id);
    } catch (e) {
      console.error("❌ Failed to fetch member:", e.message);
      return;
    }
    
    if (!member) {
      console.log(`⚠️ Member not found: ${user.username}`);
      return;
    }

    let role;
    try {
      role = guild.roles.cache.get(config.verification.roleId);
      if (!role) {
        role = await guild.roles.fetch(config.verification.roleId);
      }
    } catch (e) {
      console.error("❌ Failed to fetch role:", e.message);
      return;
    }
    
    if (!role) {
      console.error("❌ Verification role not found:", config.verification.roleId);
      return;
    }

    try {
      await member.roles.add(role);
      console.log(`✅ Verified: ${user.username} with role ${role.name} in ${guild.name}`);
    } catch (e) {
      console.error("❌ Failed to add role:", e.message);
    }
  } catch (error) {
    console.error("❌ Verification error:", error.message);
  }
});

// Login
const token = process.env.DISCORD_BOT_TOKEN;

if (!token) {
  console.error("❌ DISCORD_BOT_TOKEN not found in environment variables!");
  process.exit(1);
}

client.login(token).catch((err) => {
  console.error("❌ Login failed:", err.message);
  process.exit(1);
});
