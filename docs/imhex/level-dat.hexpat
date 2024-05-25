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

enum MapSize:u8 {
  VerySmall=0,
  Small=1,
  Medium=2,
  Large=3,
  VeryLarge=4,
};

struct DatEntry {
    char16 name[0x20];
    char16 minPlayer[0x04];
    char16 maxPlayer[0x04];
    u8 planetNameIndex;
    padding[0xF];
    u8 difficulty;
    padding[0xF];
    u8 mapTextInfoIndex;
    padding[0xF];
    MapSize mapSize;
    padding[0x3F];
    char16 time[0x18];
    u32;   
    u32;    
    u32;   
    u32;
    
};


DatEntry a @0x00;