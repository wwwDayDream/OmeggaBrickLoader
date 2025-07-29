import OmeggaPlugin, { OL, PS, PC } from 'omegga';

type Config = { foo: string };
type Storage = { bar: string };

export default class Plugin implements OmeggaPlugin<Config, Storage> {
  omegga: OL;
  config: PC<Config>;
  store: PS<Storage>;

  constructor(omegga: OL, config: PC<Config>, store: PS<Storage>) {
    this.omegga = omegga;
    this.config = config;
    this.store = store;
  }

  saveExists(saveName: string) {
    const saves = this.omegga.getSaves();
    for (var i = 0; i < saves.length; i++) {
      var save = saves[i];
      if (save.toLowerCase().endsWith('/' + saveName.toLowerCase() + '.brs')) return true;
    }
    return false;
  }

  async init() {
    this.omegga.on('cmd:savebricks', async (sender, ...args) => {
      const thisPlayer = this.omegga.getPlayer(sender);
      if (!thisPlayer.getPermissions()['BR.Permission.Building.Prefabs.SaveToServer']) {
        this.omegga.whisper(thisPlayer, 'You don\'t have permission to use this command!');
        return;
      }
      if (args.length == 0)
      {
        this.omegga.whisper(thisPlayer, 'This command requires a save name!');
        return;
      }
      var boundsData = await thisPlayer.getTemplateBoundsData();
      if (!boundsData) {
        this.omegga.whisper(thisPlayer, 'Failed! Maybe you deleted what you copied?');
        return;
      }
      this.omegga.writeSaveData(args[0], boundsData);

      this.omegga.whisper(thisPlayer, 'Saved \'' + args[0] + '\'!');
    });

    this.omegga.on('interact', (interaction) => {
      const thisPlayer = this.omegga.getPlayer(interaction.player.name);

      if (interaction.message.toLowerCase().startsWith(".loadbricks")) {
        if (!thisPlayer.getPermissions()['BR.Permission.Building.Placer']) {
          this.omegga.whisper(thisPlayer, 'You don\'t have permission to build so copying this is silly :P!');
          return;
        }
        
        var whatToLoad = interaction.message.substring(('.loadbricks').length).trimStart();
        
        if (!this.saveExists(whatToLoad)) {
          this.omegga.whisper(thisPlayer, 'The save \'' + whatToLoad + '\' doesn\'t exist!');
          return;
        }
        thisPlayer.loadBricks(whatToLoad);

        this.omegga.whisper(thisPlayer, 'Loaded \'' + whatToLoad + '\' save from server!')
        return;
      }
    });

    return { registeredCommands: ['savebricks'] };
  }

  async stop() {
  }
}
