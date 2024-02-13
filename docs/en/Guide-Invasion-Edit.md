# A Guide to Invasion Edit

## TLDR

1. Backup your Thandor folder
2. Use `PCK-Extractor` to extract `LEVEL.PCK`
3. Download zip of `LEVEL.PCK`
4. Extract content of `LEVEL.PCK.zip` into your Thandor folder
5. Delete `LEVEL.PCK`
6. Inside the `level` dir, you will find `.fld` files which can be edited in FLD-Editor.
7. Download and replace the `.fld` files after editing to play them in Thandor.

## Step 0 - Locate your game directory

-   Find your game directory where `thandor.exe` is located.
-   Your Thandor game directory should contain a `LEVEL.PCK`

<img src="../img/installation.png">

## Step 1 - Create Backup

-   Copy your game directory to create a backup

<img src="../img/create-backup.png">

## Step 2 - Start PCK-Extractor

-   Visit <https://morodar.github.io/InvasionEdit> and start `PCK Extractor`

## Step 3 - Extract LEVEL.PCK

-   Click on `EXTRACT PCK FILE`
-   Choose `LEVEL.PCK`
-   After extraction completed, click on `SAVE ZIP` to save the zip file locally.

<img src="../img/extract-level-pck.png">

## Step 4 - Extract LEVEL.PCK.zip

-   Open `LEVEL.PCK.zip` and extract `level` folder into your Thandor game directory.

<img src="../img/extract-level-pck-zip.png">

## Step 5 - Delete LEVEL.PCK

-   Delete `LEVEL.PCK`
-   _Thandor will load levels from the `level` directory_

<img src="../img/delete-lvl-pck.png">

## Step 6 - (Optional) Backup FLD files

-   Inside the `level` directory, you will find all Thandor levels.
-   Consider creating backups of your FLD files. - You can e.g. copy `asgard.fld` and rename the copy to `asgard.bak.fld`

<img src="../img/backup-fld.png">

## Step 7 - Edit, Download, Play

-   Use FLD-Editor to edit your FLD-Files
-   Save and download your FLD file, once you finished editing
-   Move and replace your existing FLD files, to play them in Thandor!
    -   If you modified `asgard.fld`, replace `asgard.fld` with your file.
    -   Thandor won't use files with different names!

_In the future, we might be able to create custom maps. But for now, we can edit exsting maps!_
<img src="../img/edit.gif">

> Note: You can't place or modify existing buildings. All buildings will always be placed on top of the landscape. You don't need to worry if you modify the location where buildings are supposed to be.

> Note: Water is also always placed on the landscape. This means that you can flood your map if you raise a river too high!
