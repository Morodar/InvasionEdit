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
  
  u8 unknown0x008[0x04];
  u8 FileIdentifier[0x04];//Checked on read, along with fileExtension for correct file format
  
  Date1 date1;
  Date1 date2;
  Date1 date3;
  
  // some parts are always empty
  u8 unknown[0x08];
  
  char16 pcname1[0x20];
  char16 pcname2[0x20];
  
  // 0x0B0
  u32 numberOfThings;//the ones staring at the b8 offset
  
  u8 unknown1[0x4c];
  char16 filename[];//unknown length
  u8 unknown2[0x200-addressof(filename)-sizeof(filename)];
  
}; 

struct samData{
//
};
struct sam{
Header header;
samData data;
};

sam File@0x0;

u32 unknownx0 @0x204;//some type of offset, start of file is added and written to this place 
u32 u2 @0x122C;//gets address of the following file (here raum00.spr) in memory
u32 unknownx1 @0x1230;//incremented at 0x5463e3
char16 extention[5] @0x125a;//here ".spr"