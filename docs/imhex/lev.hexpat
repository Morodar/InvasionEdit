struct Date1 {
  u8 ss;
  u8 mm;
  u8 hh;
  u8 none;
  u8 dd;
  u8 MM;
  u16 yyyy;
};


enum PlanetName:u32 {
  Thorgon=0,
  Avares=1,
  Gotol=2,
  Lurion=3,
  Albor=4,
  Devokles=5,
  Urdon=6,
  Golkarath=7,
  HulKhatar=8,
};

enum MapSize:u32 {
  VerySmall=0,
  Small=1,
  Medium=2,
  Large=3,
  VeryLarge=4,
};

struct MapInfo1 {
  u32 a;
  u32 b;
  u32 c;
  u32 d;
};

struct PlayerInfo1 {
  u32 camX;
  u32 camZ;
  u32 camHeight; // set to 65536
  u32 zoomLevel; // set to 4096
  u32 rotation;
  // 256 = 16 Xenit
  u32 startXenit;
  u32 startTritium;
  u32 armyOffset;
};

struct RGBA {
  u8 red;
  u8 green;
  u8 blue;
  u8 alpha;
};

struct fileArrayOffset{
  u32 count;
  u32 startOffset;
};

struct LevHeader {
  char fileExtension[0x04];
  u32 fileSize;
  
  // always 1,0,0,0,1,0,7,0?
  u8 unknown0x008[0x04];
  u8 FileIdentifier[0x04];//Always 700001 for .lev, code checks this too (seems like an alias for file type, tec has 20000)
  
  Date1 date1;
  Date1 date2;
  Date1 date3;
  
  // some parts are always empty
  u8 empty[0x08];
  
  char16 pcname1[0x20];
  char16 pcname2[0x20];
  
  // 0x0B0
  u32 fldLinkOffset;
  u32 gfxSoilOffset;
  u32 gfxWaterOffset;
  u32 gfxSkyOffset;
  
  u32 mdlArmyOffset;
  u32 gfxShotOffset;
  u32 gfxEffectenOffset;
  u32 flmOffset;
  
  u32 soundOffset;
  u32 techOffset;
  u32 entityCount;
  u32 entityArrayOffset;
  
  fileArrayOffset armFiles;
  fileArrayOffset mldFiles;
  fileArrayOffset effFiles;
  fileArrayOffset shtFiles;
  //0xe0,e8,f0,f8 are summed in 531562: Total number of files 

  char16 levelName[0x20];

  // 0x140
  u32 minPlayers;
  padding[4];
  u32 maxPlayers;
  padding[4];
  
  // 0x150
  PlanetName planetName;
  padding[12];
  
  // 0x160
  u32 maybeDifficulty;
  padding[12];
  
  // 0x170
  u32 mapTextIndex;
  padding[12];
    
  MapSize mapSize;
  padding[12];
  
  u8 empty0x190[48];
  
  char16 humanReadableTime[0x18];
  MapInfo1 mapInfo1;
}; 

struct Config1 {
  // landscape settings
  u8 row1[16];
  // shadow / sun settings
  u8 row2[16];
  // this changes graphics? (at least for buildings)
  RGBA buildingSetting1;
  RGBA buildingSetting2;
  RGBA decorationSetting1;
  RGBA decorationSetting2;
  u32 playerCount1; // required
  u32 playerCount2; // required
  u8 empty1[8];
  u8 row5[16]; // can be set to 0
  u8 row6[16]; // can be set to 0
  u8 row7[16]; // can be set to 0
  u8 row8[16]; // can be set to 0
  u8 empty[48];
};

struct Config2 {
  // can be set to 0
  u8 config2[96];
  u8 empty[224];
};

struct Config3 {
  // can be set to 0
  u8 config3[64];
  u8 empty[96];
};

struct Config4 {
  // can be set to 0
  u8 config4[64];
  u8 empty[464];
};

struct Config5 {
  // can be set to 0
  u8 config5[64];
  u8 empty[64];
};

struct MdlEntry {
  char16 path[32];
};


// -- Entity enums --
enum Player:u32 {
  None=0,
  Ares=1,
  Thorgon=2,
  Devoken=3,
  Illurer=4,
  Albor=5,
  Urdoner=6,
  Alderaden=7,
  Golrathen=8, 
};


struct Entity {
  u32 type;
  Player player;
  u32 x;
  u32 z;
  u32 rotation;
  u8 empty[12];
};

struct Lev {
  LevHeader header;
  PlayerInfo1 playerInfo[header.minPlayers-'0'];
  u8 emptyPlayerInfo[32*(7-(header.minPlayers-'0'))];
  Config1 config1;
  Config2 config2;
  Config3 config3;
  Config4 config4;
  Config5 config5;
  MdlEntry entries[10 + //10 is sum of ones that aren't accessed through array
  header.armFiles.count+
  header.mldFiles.count+
  header.effFiles.count+
  header.shtFiles.count];
  
  Entity entities[header.entityCount];
};

Lev lev @0x00;