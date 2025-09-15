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
  
  // always 07000200
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
  u32 unknown_4bd8c8;//seems to be the address of the previous spr file, raum01.spr gets the address of raum00.spr
  //maybe it has something to do with connected pieces, parent with sub objects?
  char16 filename[];//unknown
  u8 unknown2[0x200-addressof(filename)-sizeof(filename)];
  
}; 

struct u0x40Long{//length uncertain but seems to be based on loop code
 u32 u0;//some offset, gets fileStart + current value inserted at runtime
 padding[0x8];//unknown
 u32 u1;//some offset, gets fileStart + current value inserted at runtime
 padding[0x8];//unknown
 u32 u2;//some offset, gets fileStart + current value inserted at runtime
 padding[0x24];//unknown
};

struct something{
u32 u2; //Length of dataObject
padding[0x4];//unknown
u32 u3 ; // value left shift 6 (raum00 it's 1b40), some offset
//start of second dataHeader (0x220) plus u2 left shift 6 + 0x20
u32 u4;//number of things, looped over this may times


u0x40Long u5[u4] @(addressof(u2)+(u3<<6)+0x20);

};
struct sprData{
//0x004be4d0 seems to decode this file type.
//0x200 first dataHeader part
u32 u0 @0x200; //length of enire object, is used as offset for spr files with more than 1 in 0xb0
u32 u1 @0x204; // number of something, looped over

//0x220 second dataHeader part
//u1 times
something u2@0x220;
something u3@(addressof(u2)+u2.u2);
something u4@(addressof(u3)+u3.u2);
something u5@(addressof(u4)+u4.u2);
something u6@(addressof(u5)+u5.u2);
something u7@(addressof(u6)+u6.u2);
something u8_@(addressof(u7)+u7.u2);
something u9@(addressof(u8_)+u8_.u2);

};


struct spr{
Header header;
sprData data;
};

spr File@0x0;