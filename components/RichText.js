import React from "react";
import LinkIcon from "@carbon/icons-react/lib/link/24";
import Link from "next/link";
import { BLOCKS, INLINES, MARKS } from "@contentful/rich-text-types";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import styled from "styled-components";
import Highlight from "react-highlight.js";
import Anchor from "./Anchor";
import ExpandablePicture from "./ExpandablePicture";
import Video from "./Video";

const CodeSandbox = styled.div`
  border-radius: calc(${({ theme }) => theme.padding} / 2);
  box-shadow: ${({ theme }) => theme.colors.backgroundShadow};
  margin-bottom: ${({ theme }) => theme.padding};
  margin-top: ${({ theme }) => theme.padding};
  overflow: hidden;
  padding-top: 56.25%; /* Player ratio: 100 / (1280 / 720) */
  position: relative;
  width: 100%;

  iframe {
    border: none;
    height: 100%;
    left: 0;
    position: absolute;
    top: 0;
    width: 100%;
  }
`;

const QuickLinkContainer = styled.div`
  display: flex;
  position: relative;
`;

const QuickLink = styled(Anchor)`
  display: inline-flex;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    position: absolute;
    transform: ${({ heading, theme }) =>
      `translate(calc(-100% - ${theme.padding} / 2), ${
        heading === "h1" ? ".9rem" : ".625rem"
      })`};
  }

  svg {
    margin: 0;
    transform: none;
  }
`;

const makeHeaderLink = (node, heading = "h1") => {
  const link = node.content
    .filter(({ nodeType }) => nodeType === "text")
    .map(({ value }) => value.toLowerCase().split(" ").join("-"))
    .join("-");

  return documentToReactComponents(
    {
      ...node,
      content: [
        {
          content: [],
          data: {
            target: {
              fields: {
                link,
              },
              sys: {
                contentType: {
                  sys: {
                    id: "headerLink",
                  },
                },
                type: "Entry",
              },
            },
          },
          marks: [],
          nodeType: "embedded-entry-block",
        },
        ...node.content,
      ],
    },
    {
      renderNode: {
        [BLOCKS.EMBEDDED_ENTRY]: (node) => {
          if (node.data.target.sys.contentType.sys.id === "headerLink") {
            return (
              <QuickLinkContainer>
                <QuickLink
                  aria-labelledby={node.data.target.fields.link}
                  heading={heading}
                  href={`#${node.data.target.fields.link}`}
                  id={link}
                >
                  <LinkIcon />
                </QuickLink>
              </QuickLinkContainer>
            );
          }

          return null;
        },
        ...sharedBlocks,
      },
    }
  );
};

const sharedBlocks = {
  [INLINES.ENTRY_HYPERLINK]: (node) => (
    <Link as={`/${node.data.target.fields.slug}`} href="/[slug]" passHref>
      <Anchor>{node.content[0].value}</Anchor>
    </Link>
  ),
  [INLINES.HYPERLINK]: (node) => {
    const isSectionLink = !node.data.uri.includes("http");

    return (
      <Anchor
        href={node.data.uri}
        rel={!isSectionLink && "noopener noreferrer"}
        target={!isSectionLink && "_blank"}
      >
        {node.content[0].value}
      </Anchor>
    );
  },
};

export default function RichText({ content }) {
  return (
    <>
      {documentToReactComponents(content, {
        renderNode: {
          [BLOCKS.EMBEDDED_ASSET]: (node) => {
            return (
              <ExpandablePicture
                alt={node.data.target.fields.title}
                caption={node.data.target.fields.description}
                height={node.data.target.fields.file.details.image.height}
                path={node.data.target.fields.file.url}
                width={node.data.target.fields.file.details.image.width}
              />
            );
          },
          [BLOCKS.EMBEDDED_ENTRY]: (node) => {
            const entryType = node.data.target.sys.contentType.sys.id;

            if (entryType === "codeSandbox") {
              return (
                <CodeSandbox>
                  <iframe
                    src={node.data.target.fields.url}
                    sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
                    title={node.data.target.fields.title}
                  />
                </CodeSandbox>
              );
            }

            if (entryType === "video") {
              return <Video url={node.data.target.fields.url} />;
            }

            return null;
          },
          [BLOCKS.HEADING_1]: (node) => makeHeaderLink(node, "h1"),
          [BLOCKS.HEADING_2]: (node) => makeHeaderLink(node, "h2"),
          ...sharedBlocks,
        },
        renderMark: {
          [MARKS.CODE]: (text) => <Highlight>{text}</Highlight>,
        },
      })}
    </>
  );
}
