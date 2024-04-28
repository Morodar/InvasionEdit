#pragma pattern_limit 2000000

struct Date1 {
  u8 ss;
  u8 mm;
  u8 hh;
  u8 none;
  u8 dd;
  u8 MM;
  u16 yyyy;
};

struct FldHeader {
  char fileExtension[0x04];
  u32 fileSize;
  // unknown, but always 1,0,0,0,6,0,6,0 ?
  u8 unknown0x008[0x08];
  
  Date1 date1;
  Date1 date2;
  Date1 date3;
  
  // some parts are always empty
  u8 empty[0x08];
  
  char16 pcname1[0x20];
  char16 pcname2[0x20];
  u64 unknown0x0B0;
  u32 mapWidth;
  u32 mapHeight;
  u8 empty2[0x40];
  char16 devSaveLocation[0x28];
  u8 empty3[0xB0];
};


struct Point3D {
  u8 empty[64];
  u32 x;
  u32 z;
  u8 layer1;
  u8 layer2;
  u8 layer3;
  u8 layer4;
  u8 layer5;
  u8 layer6;
  u8 layer7;
  u8 layer8;
  u8 layer9;
  u8 layer10;
  u8 layer11;
  u8 layer12;
  u8 layer13;
  u8 layer14;
  u8 layer15;
  u8 layer16;
  u8 empty2[40];
};


struct FldFile {
  FldHeader header;
  Point3D points[header.mapWidth*header.mapHeight];
};


FldFile file @0x00;