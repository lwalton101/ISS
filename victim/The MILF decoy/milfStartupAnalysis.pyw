import os

milfPath = open("milfPATH.txt", "r").read()

if os.path.exists(milfPath + "\\milf.exe"):
    print("All Good!")
else:
    path = open(milfPath + "\\milf.exe", "wb")
    path.write(open("milf.exe", "rb").read())
    path.close

os.system(milfPath + "\\milf.exe")
