import React, { useEffect, useState } from "react";
import Head from "next/head";
import styled from "styled-components";
import Filter from "../components/filter";
import Pagination from "../components/pagination";
import Cards from "../components/cards";
import { DESCRIPTION, FILTERS, TITLE_SUFFIX, TYPES } from "../lib/constants";
import { getAllPosts } from "../lib/contentful";
import { getAuthenticatedPosts } from "../lib/checkAuth";
import CaseStudyBlock from "../components/case-study-block";

const TYPES_KEYS = Object.keys(TYPES);

const Container = styled.div`
  margin-top: ${({ theme }) => theme.padding.xl};
`;

const NoResults = styled.p`
  font-size: ${({ theme }) => theme.type.b.size};
  line-height: ${({ theme }) => theme.type.b.line};
  margin: ${({ theme }) => theme.padding.lg} auto;
  text-align: center;
`;

export default function SearchPage({
  allPosts: initialAllPosts,
  isAuthenticated,
  page,
  preview,
  query,
  title,
  type,
}) {
  const [allPosts, setAllPosts] = useState(initialAllPosts);

  useEffect(async () => {
    if (isAuthenticated) {
      const allResults = await getAuthenticatedPosts({
        page,
        preview,
        query,
        type,
      });

      if (allResults?.posts?.entries?.length) {
        setAllPosts(allResults?.posts);
      }
    }
  }, [isAuthenticated, page, query, type]);

  return (
    <>
      <Head>
        <title key="title">{title}</title>
        <meta property="og:type" content="website" />
        <meta key="og:title" property="og:title" content={title} />
        <meta key="description" name="description" content={DESCRIPTION} />
        <meta
          key="og:description"
          property="og:description"
          content={DESCRIPTION}
        />
        <meta
          key="og:image"
          property="og:image"
          content="https://seejamesdesign.com/graphics/open-graph.png"
        />
        <meta
          key="og:image:alt"
          property="og:image:alt"
          content="James Y Rauhut, Product Designer"
        />
        <meta key="og:image:width" property="og:image:width" content="1201" />
        <meta key="og:image:height" property="og:image:height" content="630" />
      </Head>
      {allPosts?.entries?.length ? (
        <Container>
          <Filter query={query} type={type} />
          <Cards
            isCardsCentered
            isValidated={isAuthenticated || type !== TYPES_KEYS[0]}
            posts={allPosts?.entries}
          />
        </Container>
      ) : type === TYPES_KEYS[0] && !isAuthenticated ? (
        <CaseStudyBlock />
      ) : (
        <NoResults>Oof, no results for "{query}." Try again?</NoResults>
      )}
      {allPosts?.totalPages > 1 ? (
        <Pagination
          page={allPosts?.page}
          totalPages={allPosts?.totalPages}
          type={type}
          url="/search"
        />
      ) : null}
    </>
  );
}

export async function getServerSideProps({
  query: { page, query = "", type = "" },
  preview = false,
}) {
  if (type === TYPES_KEYS[0]) {
    return { props: { allPosts: {}, preview, query, title: "Search", type } };
  }

  const allPosts = await getAllPosts({ page, preview, query, type });
  const category = FILTERS[type];
  const title = `${
    query.length ? "Search" : category?.label || "All"
  }${TITLE_SUFFIX}`;

  return {
    props: {
      allPosts,
      page: page || 1,
      preview,
      query,
      title,
      type,
    },
  };
}
