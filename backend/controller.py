
import pyautogui, time
from stop import stop_flag

def execute_steps(steps):
    for s in steps:
        if stop_flag: break
        if s.get("action")=="type":
            pyautogui.write(s["value"])
        time.sleep(0.2)
