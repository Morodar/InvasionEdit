struct Date1 {
  u8 ss;
  u8 mm;
  u8 hh;
  u8 none;
  u8 dd;
  u8 MM;
  u16 yyyy;
};

struct CgnHeader {
  char fileExtension[0x04];
  u32 fileSize;
  // unknown, but always 1,0,0,0,6,0,6,0 ?
  u8 unknown0x008[0x08];
  
  Date1 date1;
  Date1 date2;
  Date1 date3;
  
  u8 empty[0x08];
  
  char16 pcname1[0x20];
  char16 pcname2[0x20];
  u32;
  u32;
  u32 cgnCount;
  u32;
  u32;
  u32;
  padding[0x38];

};

struct CgnDatEntry {
    char16 name[0x20];
    char16 minPlayer[0x04];
    char16 maxPlayer[0x04];
    u32 mapTextInfoIndex;
    u32;
    u32;
    u32;
    u8 paddingFirst[0xA0];
};

struct CgnEntry {
    u32;u32;u32;u32;
    padding[0x30];
    u32;u32;u32;u32;
    u32;u32;u32;u32;
    padding[0xA0];
    u32 missionIndex;
    u32;
    char16 name[0x20];
    padding[0x38];
};

struct Cgn {
 CgnHeader header;
 CgnDatEntry first;
 // CgnEntry entries[2];
 CgnEntry entries[header.cgnCount];
};

Cgn cgn @0x00;