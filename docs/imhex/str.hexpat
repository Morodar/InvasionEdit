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


struct StrHeader {
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
  u32 languageCount;//number of "things"? Seems to be used by all standard file types, sound, mld, arm, eff
  u8 empty2[0x4c];
  char16 path[0x80];//hetra path is longer, empty3 section is likely also path
};


struct IndexInfo {
   u32 totalSizeOfLanguage;
   u32 indexCount;
   u32 c;//language? unique for each language and would still fit with winstr (different order since english is first and only)and hetra 
   u32 d;
};


struct StrTextsIndex {
   u32 startOffset;
   u32 endOffset = std::mem::read_unsigned($,4);
   u32 length = (endOffset-startOffset)/2;
};

struct StrText {
    u32 index = std::core::array_index();
    u32 start = parent.offsets[index].startOffset;
    u32 end = parent.offsets[index].endOffset;
    u32 length = parent.offsets[index].length;
    std::print("index: {}; start: {}; end: {}; length: {}",index, start,end,length);
    char16 text[length];//New lines are encoded as a single 0x8012 char. 
    //Other special encodings are for text fomatting I believe, things like adding in variables and such.
    //example canbe found @0x34f6 of menue.str
    //that has 18 80 F0 7F F0 7F F0 7F F0 7F but a lot of the stings in that file have it.
};

struct Texts{
    IndexInfo indexInfo;
    StrTextsIndex offsets[indexInfo.indexCount-1];
    u32 lastIndexOffset;
    
    u32 lastStringLength=(indexInfo.totalSizeOfLanguage-lastIndexOffset)/2;
    
    StrText texts[indexInfo.indexCount-1];
    char16 lastText[lastStringLength];
};

struct StrFile {
    StrHeader strHeader;
    Texts texts[strHeader.languageCount];
};


StrFile file @ 0x00;