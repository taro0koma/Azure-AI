// import文-----------------------------------------------------------------------
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { OpenAIClient } from "@azure/openai";
import { AzureKeyCredential} from "@azure/core-auth"

//--------------------------------------------------------------------------------
dotenv.config();

const azureOpenAIClient = new OpenAIClient(
  process.env.AZURE_OPEN_AI_URL,
  new AzureKeyCredential(process.env.AZURE_OPENAI_API_KEY)
);

const app = express();
app.use(cors());
app.use(express.json());

// 処理------------------------------------------------------------------------

// 表現ぴったり探し用
app.get('/', async (req, res) => {
  res.status(200).send({
    message: 'Hello 表現'
  });
});

app.post('/', async (req, res) => {
  try {
    const prompt = req.body.prompt;
    // GASの定時実行のための分岐
    if (prompt === 'just say "A"!') {
      console.log("GASからの定時実行");
      res.status(200).send({
        bot: "GASからの定時実行"
      });
      return;
    }

    const user_prompt = `「${prompt}」という言葉をゆたかに表現するため、日本の作文に使われそうな1文の文章を10パターン用意してください。1個目は、どれくらいか程度を表すもの。2個目は、動作を含めた表現にしてください。3個目は、心の中のつぶやきを含めた表現にしてください。4個目は、過去の気持ちで表現してください。5個目は、感情を強調した表現にしてください。6個目は、音や様子を含めて表現してください。7個目は、心の中の叫びのように表現してください。8個目は、何かに影響されて心が変化する様子を含めて下さい。9個目は、無意識で何かをしてしまう様子を含めて下さい。10個目は、自分の表情を含めて表現して下さい。また、一つ一つに改行を入れて下さい。`;

    const deploymentName = "gpt-4o"; // Adjust this to your deployment name
    const response = await azureOpenAIClient.getCompletions(deploymentName, {
      prompt: user_prompt,
      temperature: 0.2,
      maxTokens: 3000,
      topP: 1,
      frequencyPenalty: 0.5,
      presencePenalty: 0,
    });

    res.status(200).send({
      bot: response.choices[0].text
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
});

// 表現ぴったり探し以外のとき用-----------------------------------------------

app.post('/danraku', async (req, res) => {
  try {
    const grade = req.body.gakunen;
    const grades = {
      s1: ["7歳", "松谷みよ子"],
      s2: ["8歳", "あんびるやすこ"],
      s3: ["9歳", "安西水丸"],
      s4: ["10歳", "角野栄子"],
      s5: ["11歳", "宮沢賢治"],
      s6: ["12歳", "ヨシタケシンスケ"],
      t1: ["13歳", "新見南吉"],
      t2: ["14歳", "重松清"],
      t3: ["15歳", "森絵都"],
      k1: ["16歳", "住野よる"],
      k2: ["17歳", "小川洋子"],
      k3: ["18歳", "梨木香歩"],
      oldPeople: ["大人", "あさのあつこ"],
    };

    const prompt = req.body.prompt;

    const deploymentName = "gpt-4o"; 
    const response = await azureOpenAIClient.getCompletions(deploymentName, {
      prompt: `${grades[grade][0]}向けにしてください。${prompt}指示に従わない場合は再度指示を確認します。最後に「分かりました」や「了解しました」といったコメントを一切加えないでください。`,
      temperature: 0.2,
      maxTokens: 3000,
      topP: 1,
      frequencyPenalty: 0.5,
      presencePenalty: 0,
    });

    res.status(200).send({
      bot: response.choices[0].text
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
});

app.get('/danraku', async (req, res) => {
  res.status(200).send({
    message: 'Hello その他'
  });
});

app.listen(5000, () => console.log('サーバーは動いています！ポート：http://localhost:5000'));
