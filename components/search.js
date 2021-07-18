import React, { useEffect, useState } from "react";
import SeachIcon from "@carbon/icons-react/lib/search/20";
import Router from "next/router";
import styled from "styled-components";
import ButtonToggle from "./button-toggle";
import Input from "./input";

const Absolute = styled.div`
  display: flex;
  height: 100%;
  position: absolute;
  right: 0;
`;

const Form = styled.form`
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.padding.xs};
  box-shadow: ${({ hideBoxShadow, theme }) =>
    hideBoxShadow ? "none" : theme.colors.backgroundShadowLarge};
  display: flex;
  justify-content: flex-end;
  position: relative;
  max-width: 20rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    box-shadow: none;
  }
`;

const PLACEHOLDER_QUERIES = [
  "Progressive Web App",
  "Component Library",
  "Design System",
  "Grid Design",
];

export default function Search({
  hideBoxShadow,
  isRequired,
  onSubmit = () => {},
  shouldClearOnSubmit,
  query = "",
}) {
  const [placeholder, setPlaceholder] = useState();
  const [value, setValue] = useState(query);

  useEffect(() => {
    setPlaceholder(
      PLACEHOLDER_QUERIES[
        Math.floor(Math.random() * PLACEHOLDER_QUERIES.length)
      ]
    );
  }, []);

  return (
    <Form
      hideBoxShadow={hideBoxShadow}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();

        Router.push({
          pathname: "/search",
          query: value && { query: value },
        });
        if (shouldClearOnSubmit) {
          setValue("");
        }
      }}
    >
      <Input
        aria-label="Search Query"
        hasTrailingIcon
        name="query"
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        required={isRequired}
        type="text"
        value={value}
      />
      <Absolute>
        <ButtonToggle
          aria-label="Submit Search"
          hideOuterBoxShadow
          type="submit"
        >
          <SeachIcon />
        </ButtonToggle>
      </Absolute>
    </Form>
  );
}
