import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage } from "@langchain/core/messages";
import { initializeAgent } from "./utils";
import { StateType } from "@langchain/langgraph";

export class LangchainAgent {
  private constructor(
    private agent: ReturnType<typeof createReactAgent>,
    private config: { configurable: { thread_id: string } }
  ) {}

  static async create(): Promise<LangchainAgent> {
    const { agent, config } = await initializeAgent();
    return new LangchainAgent(agent, config);
  }

  async sendPrompt(prompt: { text: string }): Promise<StateType<any>> {
    const response = await this.agent.invoke(
      {
        messages: [new HumanMessage(prompt.text)],
      },
      this.config
    );

    return response;
  }
}
