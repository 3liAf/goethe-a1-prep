import asyncio
import json
import os
import edge_tts

async def process_task(task, semaphore, counter, total):
    async with semaphore:
        out_path = task['outputFile']
        os.makedirs(os.path.dirname(out_path), exist_ok=True)

        if os.path.exists(out_path) and os.path.getsize(out_path) > 1000:
            print(f"[{counter['done'] + 1}/{total}] Skipped existing {out_path}")
            counter['done'] += 1
            return

        text = task['audioScript']
        # Choose voice: Teil 2 is public announcement (Katja), Teil 1/3 alternate
        if task['teil'] == 2:
            voice = 'de-DE-KatjaNeural'
        elif task['questionNumber'] % 2 == 0:
            voice = 'de-DE-KatjaNeural'
        else:
            voice = 'de-DE-KillianNeural'

        # Standard Goethe A1 cadence
        rate = "-4%"

        try:
            communicate = edge_tts.Communicate(text, voice, rate=rate)
            await communicate.save(out_path)
            counter['done'] += 1
            print(f"[{counter['done']}/{total}] Generated: {out_path} ({voice})")
        except Exception as e:
            print(f"Error on {task['questionId']}: {e}")

async def main():
    with open('scripts/audio_tasks.json', 'r', encoding='utf-8') as f:
        tasks = json.load(f)

    total = len(tasks)
    print(f"Starting audio generation for {total} files...")

    semaphore = asyncio.Semaphore(6) # 6 concurrent downloads
    counter = {'done': 0}

    coros = [process_task(t, semaphore, counter, total) for t in tasks]
    await asyncio.gather(*coros)
    print("All audio files generated successfully!")

if __name__ == '__main__':
    asyncio.run(main())
