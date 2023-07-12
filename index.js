const {
  Client,
  Events,
  GatewayIntentBits,
  REST,
  Routes,
} = require("discord.js");

const cron = require("node-cron");

const { SlashCommandBuilder } = require("discord.js");

let config = require("./config.json");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

let pingCommand = new SlashCommandBuilder()
  .setName("pingstart")
  .setDescription("Pings a user in a defined channel")
  .addUserOption((option) =>
    option.setName("user").setDescription("User to Ping")
  )
  .addChannelOption((option) =>
    option.setName("channel").setDescription("Channel to Ping in.")
  )
  .addStringOption((option) =>
    option.setName("message").setDescription("Message for ping.")
  );

let stopCommand = new SlashCommandBuilder()
  .setName("pingstop")
  .setDescription("stops all Ping threads");

let tasks = [];

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName == "pingstart") {

    const user = interaction.options.getUser("user");
    const channel = interaction.options.getChannel("channel");
    const message = interaction.options.getString("message")

    if(!message){
        message = "Daher!!!";
    }
    

    interaction.reply(`Done.`);

    let thread = await channel.threads.create({
      name: user.username + " Daher!!!",
      autoArchiveDuration: 60,
      reason: "lmao",
    });
    thread.send(user.toString() + " "+message);
    let task = cron.schedule("9 * * * *", () => {
      thread.send(user.toString() + " "+message);
    });

    tasks.push(task);
  }

  if (interaction.commandName == "pingstop") {
    interaction.reply(`Done.`);
    tasks.forEach((task) => {
      task.stop();
    });
  }
});

const rest = new REST({ version: "10" }).setToken(config.token);

(async () => {
  try {
    console.log(`Started refreshing application (/) commands.`);

    await rest.put(Routes.applicationCommands(config.clientId), {
      body: [pingCommand, stopCommand],
    });

    console.log(`Successfully reloaded application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
})();

client.login(config.token);
