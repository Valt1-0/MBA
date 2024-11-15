import React from "react";
import { View, Text } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import SwipeUp from "../../../components/SwipeUp";
 

const meta = {
  title: "SwipeUp",
  component: SwipeUp,
  argTypes: {
    onPositionChange: { action: "position changed" },
  },
  args: {
    parentHeight: 600,
    positions: [10, 35, 50, 100],
  },
  decorators: [
    (Story) => (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          height: 600,
        }}
      >
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof SwipeUp>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: (args) => (
    <SwipeUp {...args}>
      <View style={{ padding: 20 }}>
        <Text>Swipe Up Content</Text>
      </View>
    </SwipeUp>
  ),
};
