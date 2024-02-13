# Anleitung für den FLD-Editor

## TLDR

1. Erstelle ein Backup von deinem Thandor-Ordner.
2. Extrahiere `LEVEL.PCK` über den `PCK-Extractor`.
3. Lade die Zip der `LEVEL.PCK` herunter.
4. Extrahiere den Inhalt aus der `LEVEL.PCK.zip` in deinen Thandor-Ordner
5. Lösche `LEVEL.PCK`
6. Im `level` Ordner wirst du `.fld`-Dateien finden, die du im FLD-Editor bearbeiten kannst.
7. Lade nach dem Editieren die `.fld` Datei vom `FLD-Editor` herunter und ersetze die Date in deinem `level` Ordner, um sie in Thandor spielen zu können.

## Schritt 0 - Finde dein Spielverzeichnis

-   Suche nach dem Ordner, in dem sich die `thandor.exe` befindet.
-   Dieser Ordner sollte eine `LEVEL.PCK` enthalten.

<img src="../img/installation.png">

## Schritt 1 - Backup erstellen

-   Kopiere das Spielverzeichnis, um ein Backup zu erstellen.

<img src="../img/create-backup.png">

## Schritt 2 - Start PCK-Extractor

-   Besuche <https://morodar.github.io/InvasionEdit> und starte den `PCK Extractor`

## Schritt 3 - Extrahiere LEVEL.PCK

-   Klicke auf `PCK-DATEI EXTRAHIEREN`
-   Wähle deine `LEVEL.PCK` aus
-   Klicke auf `ZIP SPEICHERN`, um die extrahierte Datei zu als Archiv zu speichern.

<img src="../img/extract-level-pck.png">

## Schritt 4 - Extrahiere LEVEL.PCK.zip

-   Öffne `LEVEL.PCK.zip` und extrahiere den `level`-Ordner in dein Thandor Verzeichnis.

<img src="../img/extract-level-pck-zip.png">

## Schritt 5 - Lösche LEVEL.PCK

-   Lösche `LEVEL.PCK`
-   _Thandor wird die Levels aus dem `level`-Verzeichnis laden_

<img src="../img/delete-lvl-pck.png">

## Schritt 6 - (Optional) Erstelle ein Backup für die FLD Dateien

-   Im `level`-Verzeichnis findest du alle Thandor-Levels.
-   Erstelle ggf. eine Sicherung der FLD-Dateien. Kopiere beispielsweise `asgard.fld` und bennene die Kopie in `asgard.bak.fld` um.

<img src="../img/backup-fld.png">

## Schritt 7 - Edit, Download, Play

-   Verwende den FLD-Editor, um die FLD-Dateien zu editieren.
-   Speichere und lade die überarbeite FLD Dateien nach dem Editieren herunter.
-   Verschiebe und ersetze die existierenden FLD Dateien im `level`-Ordner, um die überarbeitete Levels in Thandor zu spielen!
    -   Wenn du `asgard.fld` überarbeitet hast, ersetze die `asgard.fld` Datei.
    -   Thandor wird keine anderen Dateinamen laden!

_In der Zukunft wird es eventuell möglich sein, neue Levels zu erstellen. Fürs Erste aber, können wir existierende Levels überarbeiten!_

<img src="../img/edit.gif">

> Hinweis: Du kannst aktuell keine Gebäuden plazieren oder existierende Gebäude verändern. Alle Gebäude werden immer auf der Landschaft plaziert. D.h. du musst dir keine Gedanken machen, solltest du Orte verändern, an denen sich normalerweise Gebäude befinden.

> Achtung: Wasser wird ebenfalls immer auf der Landschaft platziert. D.h. du kannst deine Karte fluten, sofern du einen Fluss zu weit hochhebst!
