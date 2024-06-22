struct CgnEntry {
    char16 name[0x20];
    char16 minPlayer[0x04];
    char16 maxPlayer[0x04];
    u8 mapTextInfoIndex;
    padding[0x9F];
    u32;   
    u32;    
    u32;   
    u32;
};


CgnEntry a @0x00;