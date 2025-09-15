struct Date1 {
  u8 ss;
  u8 mm;
  u8 hh;
  u8 none;
  u8 dd;
  u8 MM;
  u16 yyyy;
};

struct PckHeader {
    char fileExtension[0x04] @0x00;
    u32 fileSize @ 0x04;
    
    // unknown, but always 1,0,0,0,0,0,1,0
    u8 unknown0x008[0x08] @ 0x08;

    Date1 date1 @ 0x010;
    Date1 date2 @ 0x018;
    Date1 date3 @ 0x020;
    
    // some parts are always empty
    u8 empty[0x08] @ 0x28;
    
    char16 pcname1[0x20] @ 0x30;
    char16 pcname2[0x20] @ 0x70;
    
    // files this pck contains
    u32 fileCount @ 0xB0;
    
    u8 empty2[0x14C] @ 0xB4;
};

struct FileEntry {
  char16 filename[0xf6]; //? not sure on length see obsidian
  u8 writtenToInMemory[0x4];
  u32 unpackedSize;
  u32 fileType;
  u32 packedSize;
  u32 dataFormat;
  if(dataFormat==2){
    u32 newSize;
    u8 empty2[12];
    u8 dataBytes[packedSize-16];
  }else{
    u8 dataBytes[packedSize];
  }//rename first part of dataBytes to compression algo?
};


PckHeader header @0x00;
FileEntry files[header.fileCount] @0x200;