#include <std/mem.pat>
import std.io;
import std.core;

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


struct FlmHeader {
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
  u32 VideoWidth;//width in pixels
  u32 VideoHeight;//height in pixels
  u32 FrameCount;
  u32 unknown0xbc;//unknown, is checked in 0x004a870d possibly for audio content?
  u32 DataSize;//max size is 0x3c0000-0x200 as checked in 0x4A868A or maybe max is 0x3a2000, checked in 0x4A86C7
  u32 SamDataLength;
  u8 empty2[0xfc-addressof(SamDataLength)-sizeof(SamDataLength)];
  u32 framerate;
  u8 empty3[0x200-addressof(framerate)-sizeof(framerate)];

};


struct FlmFile {
    FlmHeader flmHeader;
    u8 videoData[flmHeader.DataSize];
//    if(flmHeader.SamDataLength != 0)
//        sam audioFile;
};


FlmFile file @ 0x00;