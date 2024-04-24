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
  s32 x;
  s32 z;
  u32 a;
  u32 b;
  u32 c;
  u8 empty[0xC];
};

struct LevHeader {
  char fileExtension[0x04];
  u32 fileSize;
  u8 unknown0x008[0x08];
  
  Date1 date1;
  Date1 date2;
  Date1 date3;
  
  // some parts are always empty
  u8 empty[0x08];
  
  char16 pcname1[0x20];
  char16 pcname2[0x20];
  
  // 0x0B0
  u32 u0x0B0;
  u32 u0x0B4;
  u32 u0x0B8;
  u32 u0x0BC;
  
  u32 u0x0C0;
  u32 u0x0C4;
  u32 u0x0C8;
  u32 u0x0CC;
  
  u32 u0x0D0;
  u32 u0x0D4;
  u32 asset_count;
  u32 u0x0DC;
  
  u32 u0x0E0;
  u32 u0x0E4;
  u32 u0x0E8;
  u32 u0x0EC;
  
  u32 u0x0F0;
  u32 u0x0F4;
  u32 u0x0F8;
  u32 u0x0FC;

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

struct Lev {
  LevHeader header;
  PlayerInfo1 playerInfo[header.minPlayers-'0'];
  u8 emptyPlayerInfo[32*(7-(header.minPlayers-'0'))];
};

Lev lev @0x00;