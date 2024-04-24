// there are two variants how Thandor defines a date
// -- begin dates
struct Date1 {
  u8 ss;
  u8 mm;
  u8 hh;
  u8 none;
  u8 dd;
  u8 MM;
  u16 yyyy;
};

struct Date2 {
  u8 dd;
  u8 MM;
  u16 yyyy;
  u8 ss;
  u8 mm;
  u8 hh;
  u8 none;
};
// -- end dates