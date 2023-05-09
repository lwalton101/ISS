import pyautogui, random

x,y = pyautogui.position()
x += random.randrange(posMin, posMax)
y += random.randrange(posMin, posMax)

pyautogui.moveTo(x, y)