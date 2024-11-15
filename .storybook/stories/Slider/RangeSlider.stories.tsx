import React from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import RangeSlider from "../../../components/Slider";

const meta = {
  title: "RangeSlider",
  component: RangeSlider,
  argTypes: {
    onSlidingComplete: { action: "sliding complete" },
  },
  args: {
    min: 0,
    max: 100,
    step: 1,
    value: 50,
  },
  decorators: [
    (Story) => (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
        }}
      >
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof RangeSlider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: (args) => <RangeSlider {...args} />,
};
