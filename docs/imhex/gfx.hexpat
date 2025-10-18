struct Date1 {
  u8 ss;
  u8 mm;
  u8 hh;
  u8 none;
  u8 dd;
  u8 MM;
  u16 yyyy;
};

struct Header {
  char fileExtension[0x04];
  u32 fileSize;
  
  // always 
  u8 unknown0x008[0x04];
  u8 FileIdentifier[0x04];//Checked on read, along with fileExtension for correct file format
  
  Date1 date1;
  Date1 date2;
  Date1 date3;
  
  // some parts are always empty
  u8 empty[0x08];
  
  char16 pcname1[0x20];
  char16 pcname2[0x20];
  
  // 0x0B0
  u32 numberOfThings;//the ones staring at the b8 offset
  
  u32 unknown;
  u32 unknownOffset;
  
  //you get to the thing at desired index by << 5 so 86 << 5 becomes 10c0 offset compared to start things
  //because each thing is 0x20 long

}; 

struct thing {
  u32 a;
  u32 b;
  u32 unknown[6];
};

struct gfx{
  Header header;
  thing thingArray[header.numberOfThings] @header.unknownOffset;
};

gfx File@0x0;