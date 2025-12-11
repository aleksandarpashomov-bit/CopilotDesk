
import os
from flask import Flask, request
from vision import analyze_screen
from planner import plan_actions
from controller import execute_steps
from stop import set_stop

openai_key = os.getenv("OPENAI_KEY")
gemini_key = os.getenv("GEMINI_KEY")

app = Flask(__name__)

@app.route("/process", methods=["POST"])
def process():
    data = request.json
    if data.get("stop"):
        set_stop()
        return {"status":"stopped"}
    prompt=data["prompt"]
    screen=analyze_screen()
    steps=plan_actions(prompt,screen)
    execute_steps(steps)
    return {"status":"done","steps":steps}

if __name__=="__main__":
    app.run(port=5001)
