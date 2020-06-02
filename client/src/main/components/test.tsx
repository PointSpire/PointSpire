import React from 'react';

export interface TestElementProps {
  id: string;
}

export interface TestElementState {
  message: string;
}

class TestElement extends React.Component<TestElementProps, TestElementState> {
  constructor(props: TestElementProps) {
    super(props);
    this.state = {
      message: '',
    };
  }

  render(): JSX.Element {
    const { message } = this.state;
    const { id } = this.props;
    return (
      <div id={id}>
        <p>
          TEST
          {message}
        </p>
      </div>
    );
  }
}
export default TestElement;
