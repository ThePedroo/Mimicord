const DiscordUser = {
  id: 1000000000000000,
  username: 'Concord',
  discriminator: '0001',
  global_name: 'ConcordGlobal',
  avatar: 'ConcordAvatar'.toString('base64'),
  bot: false,
  system: false,
  mfa_enabled: false,
  banner: 'ConcordBanner'.toString('base64'),
  accent_color: 0,
  locale: 'pt-BR',
  verified: true,
  email: 'concord@concord.com',
  flags: 0 | (1 << 0),
  premium_type: 0,
  public_flags: 0 | (1 << 0),
  avatar_decorations: 'ConcordAvatarDecorations'.toString('base64'),
}

const DiscordUnavailableGuild = {
  id: 1000000000000001,
  unavailable: true
}

// https://discord.com/developers/docs/resources/application#application-object
const Application = {
  id: 1000000000000002,
  flags: 0,
  // TODO: implement the rest of the fields
}

const DiscordMessage = {
  id: 1000000000000003,
  channel_id: 1000000000000004,
  author: DiscordUser,
  content: 'Concord message content',
  timestamp: new Date().toISOString(),
  edited_timestamp: null,
  tts: false,
  mention_everyone: false,
  mentions: [],
  mention_roles: [],
  mention_channels: [],
  attachments: [],
  embeds: [],
  reactions: [],
  nonce: 0,
  pinned: false,
  webhook_id: null,
  type: 0,
  activity: null,
  application: null,
  application_id: null,
  message_reference: null,
  flags: 0,
  referenced_message: null,
  interaction_metadata: null,
  interaction: null,
  thread: null,
  components: [],
  sticker_items: [],
  stickers: [],
  position: 0,
  role_subscription_data: null,
  resolved: null,
  poll: null
}

export default {
  DiscordUser,
  DiscordUnavailableGuild,
  Application,
  DiscordMessage
}